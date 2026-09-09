import { centavos } from '../../dominio/dinheiro.ts';
import type {
  ConectorLoja,
  CupomBruto,
  OfertaBruta,
  ProdutoCandidato,
  Saude,
  TipoSeller,
} from '../conector.ts';

/**
 * Época Cosméticos — VTEX, degrau 3 da escada.
 *
 * É a única das sete lojas com acesso confirmado. A sonda de 06/09/2026
 * devolveu `429 Too Many Requests` numa requisição só, o que **não é
 * bloqueio**: é limite por IP. O endpoint existe e entrega EAN, preço,
 * variante e vendedor de graça, num JSON estruturado.
 *
 * Por isso o teto de requisição aqui é conservador e o conector espera
 * entre chamadas. A regra da casa é coleta educada (doc 06 §5) — e no caso
 * da Época ela é também a condição de continuar tendo acesso.
 */

const HOST = 'https://www.epocacosmeticos.com.br';

/** O que o endpoint público da VTEX devolve, na parte que usamos. */
type ProdutoVTEX = {
  productId: string;
  productName: string;
  brand?: string;
  link?: string;
  items?: {
    itemId: string;
    name?: string;
    ean?: string;
    sellers?: {
      sellerId: string;
      sellerName: string;
      commertialOffer?: {
        Price?: number;
        ListPrice?: number;
        IsAvailable?: boolean;
        AvailableQuantity?: number;
      };
    }[];
  }[];
};

/**
 * A VTEX não diz se o vendedor é oficial — ela dá o nome.
 *
 * A classificação de RN-12 é curadoria, e mora no banco (tabela `seller`).
 * Aqui só marcamos o caso evidente: quando o vendedor é a própria loja.
 * Todo o resto entra como `terceiro`, que é o padrão desconfiado — e é o
 * que a D18 manda: na dúvida, não notificar.
 */
function classificarSeller(nome: string): TipoSeller {
  return /época|epoca/i.test(nome) ? 'oficial' : 'terceiro';
}

export class ConectorEpoca implements ConectorLoja {
  readonly slug = 'epoca';
  readonly nome = 'Época Cosméticos';
  readonly degrauAcesso = 3 as const;
  /** o 429 na sonda pediu calma; começamos devagar e só subimos com medida */
  readonly reqPorSegundo = 0.5;

  #ultimoSucesso: Date | null = null;
  #tentativas = 0;
  #parses = 0;
  #latencias: number[] = [];

  constructor(private readonly userAgent: string) {}

  /** Endpoint público não precisa de credencial — por isso a Época é a primeira. */
  estaConfigurado() {
    return true;
  }

  async buscarProduto(consulta: string): Promise<ProdutoCandidato[]> {
    const url = `${HOST}/api/catalog_system/pub/products/search/?ft=${encodeURIComponent(consulta)}&_from=0&_to=9`;
    const dados = await this.#buscar<ProdutoVTEX[]>(url);
    if (!dados) return [];

    return dados.map((p) => ({
      idExterno: p.productId,
      nome: p.productName,
      ...(p.brand ? { marca: p.brand } : {}),
      ...(p.items?.[0]?.ean ? { ean: p.items[0].ean } : {}),
      url: p.link ?? `${HOST}/`,
    }));
  }

  async obterOferta(idExterno: string): Promise<OfertaBruta | null> {
    const url = `${HOST}/api/catalog_system/pub/products/search/?fq=productId:${encodeURIComponent(idExterno)}`;
    const dados = await this.#buscar<ProdutoVTEX[]>(url);
    const p = dados?.[0];
    const item = p?.items?.[0];
    const oferta = item?.sellers?.[0];
    const comercial = oferta?.commertialOffer;

    if (!p || !item || !oferta || comercial?.Price == null) return null;

    return {
      // a VTEX devolve reais como número; convertemos para centavos aqui,
      // no limite do sistema, e nunca mais lidamos com fração
      preco: centavos(Math.round(comercial.Price * 100)),
      ...(comercial.ListPrice != null
        ? { precoDe: centavos(Math.round(comercial.ListPrice * 100)) }
        : {}),
      disponivel: comercial.IsAvailable ?? (comercial.AvailableQuantity ?? 0) > 0,

      sellerIdExterno: oferta.sellerId,
      sellerNome: oferta.sellerName,
      sellerTipo: classificarSeller(oferta.sellerName),

      ...(item.ean ? { eanRetornado: item.ean } : {}),
      nomeRetornado: p.productName,
      // na VTEX o nome do item difere do nome do produto quando há variante
      ...(item.name && item.name !== p.productName
        ? { varianteRetornada: item.name }
        : {}),

      url: p.link ?? `${HOST}/`,
      origem: 'endpoint_publico',
      coletadoEm: new Date(),
    };
  }

  /**
   * A VTEX não expõe cupom no endpoint público.
   *
   * Devolver lista vazia é a resposta honesta: cupom da Época vem por feed
   * de afiliado (degrau 1) ou pela fila humana. Fingir que não há cupom é
   * diferente de fingir que não existe fonte.
   */
  async obterCupons(): Promise<CupomBruto[]> {
    return [];
  }

  async saude(): Promise<Saude> {
    const ordenadas = [...this.#latencias].sort((a, b) => a - b);
    const p95 = ordenadas.length
      ? (ordenadas[Math.floor(ordenadas.length * 0.95)] ?? null)
      : null;
    return {
      ok: this.#ultimoSucesso !== null,
      latenciaP95Ms: p95,
      ultimoSucesso: this.#ultimoSucesso,
      // a métrica que denuncia a quebra silenciosa quando a loja muda o layout
      taxaParse: this.#tentativas ? this.#parses / this.#tentativas : null,
    };
  }

  async #buscar<T>(url: string): Promise<T | null> {
    this.#tentativas += 1;
    const t0 = Date.now();
    const ctl = new AbortController();
    const corta = setTimeout(() => ctl.abort(), 12_000);

    try {
      const r = await fetch(url, {
        signal: ctl.signal,
        headers: { accept: 'application/json', 'user-agent': this.userAgent },
      });
      this.#latencias.push(Date.now() - t0);
      if (this.#latencias.length > 200) this.#latencias.shift();

      // 429 é a loja pedindo calma. Não é para insistir nem trocar de
      // cabeçalho: é para desacelerar. Escalar aqui seria evasão (C3).
      if (r.status === 429) return null;
      if (!r.ok) return null;

      const corpo = (await r.json()) as T;
      this.#parses += 1;
      this.#ultimoSucesso = new Date();
      return corpo;
    } catch {
      return null;
    } finally {
      clearTimeout(corta);
    }
  }
}
