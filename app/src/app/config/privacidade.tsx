import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Txt } from '@/components/primitives';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space } from '@/design/tokens';

/**
 * Privacidade e dados.
 *
 * Os textos aqui descrevem o que o app de fato faz. O que ainda depende de
 * dados reais — razão social, CNPJ, nome e e-mail do encarregado, prazo de
 * resposta contratado — está marcado como pendente em vez de inventado:
 * política de privacidade com dado fictício é pior que política nenhuma.
 *
 * Nada nesta tela substitui revisão jurídica.
 */

type Consent = {
  id: string;
  titulo: string;
  corpo: string;
  /** o que ela perde ao recusar — LGPD art. 18, VIII */
  seRecusar: string;
};

const CONSENTIMENTOS: Consent[] = [
  {
    id: 'push',
    titulo: 'Avisos no celular',
    corpo: 'Notificação quando um preço cai ou um cupom passa a valer no seu produto.',
    seRecusar: 'O app continua funcionando, mas você só descobre as quedas ao abrir.',
  },
  {
    id: 'melhoria',
    titulo: 'Usar minhas compras para melhorar as previsões',
    corpo:
      'O que você comprou, por quanto e quando, de forma agregada com a de outras pessoas, para calibrar a previsão sazonal por produto.',
    seRecusar: 'As previsões que você vê passam a usar só a média geral, não o seu ritmo.',
  },
  {
    id: 'marketing',
    titulo: 'Novidades por e-mail',
    corpo: 'Mensagens sobre recursos novos e sobre as épocas do ano que valem a espera.',
    seRecusar: 'Nada. Você continua recebendo os avisos de preço normalmente.',
  },
];

const DIREITOS = [
  { art: 'art. 18, I e II', txt: 'Saber se tratamos dados seus e acessar tudo o que temos.' },
  { art: 'art. 18, III', txt: 'Corrigir dado incompleto, inexato ou desatualizado.' },
  {
    art: 'art. 18, IV',
    txt: 'Pedir anonimização, bloqueio ou eliminação de dado desnecessário ou excessivo.',
  },
  { art: 'art. 18, V', txt: 'Levar seus dados para outro serviço, em formato legível por máquina.' },
  { art: 'art. 18, VI', txt: 'Eliminar os dados tratados com base no seu consentimento.' },
  { art: 'art. 18, VII', txt: 'Saber com quem compartilhamos os seus dados.' },
  { art: 'art. 18, IX', txt: 'Revogar qualquer consentimento, a qualquer momento.' },
  {
    art: 'art. 20',
    txt: 'Pedir revisão de decisão tomada só por máquina — como o veredito de um cupom ou a recomendação de esperar.',
  },
];

export default function Privacidade() {
  const s = useS();
  const c = useTheme();
  const router = useRouter();
  const [ligados, setLigados] = useState<Record<string, boolean>>({
    push: true,
    melhoria: true,
    marketing: false,
  });
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Privacidade e dados"
        subtitle="LGPD — Lei 13.709/2018"
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Block>
          <Text style={s.h}>O que o Aptum guarda</Text>
          <Txt variant="body" style={s.p}>
            Os produtos que você monitora, suas listas, os preços que você registrou ao
            comprar e as suas preferências de aviso. Guardamos também o seu e-mail, para
            login e recuperação.
          </Txt>
          <Txt variant="body" style={s.p}>
            <Text style={s.b}>Não</Text> guardamos cartão, CPF, endereço nem o conteúdo do
            seu carrinho na loja. O Aptum não vende: a compra acontece no site da loja, fora
            daqui.
          </Txt>
          <Txt variant="body" style={s.p}>
            Registros de acesso ficam por 6 meses, como exige o Marco Civil da Internet
            (art. 15). O resto fica enquanto a sua conta existir.
          </Txt>
          <Txt variant="body" style={s.p}>
            Guardar as suas listas não depende de consentimento: a base legal é a execução
            do contrato — é o próprio serviço. Por isso não existe um botão para desligar
            isso. O caminho para encerrar é apagar a conta.
          </Txt>
        </Block>

        <Text style={s.secao}>Consentimentos</Text>
        <Txt variant="body" style={s.secaoNota}>
          Revogar é gratuito e vale na hora (art. 8º, §5º). Toque para ver o que muda se
          você desligar.
        </Txt>

        <View style={s.grupo}>
          {CONSENTIMENTOS.map((k, i) => {
            const on = ligados[k.id];
            const expandido = aberto === k.id;
            return (
              <View key={k.id} style={[s.item, i < CONSENTIMENTOS.length - 1 && s.itemDiv]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${k.titulo}. ${k.corpo}`}
                  onPress={() => setAberto(expandido ? null : k.id)}
                  style={s.itemTopo}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemTitulo}>{k.titulo}</Text>
                    <Txt variant="body" style={{ marginTop: 2 }}>
                      {k.corpo}
                    </Txt>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={k.titulo}
                    hitSlop={8}
                    onPress={() => setLigados((v) => ({ ...v, [k.id]: !v[k.id] }))}
                    style={[s.sw, on && s.swOn]}>
                    <View style={[s.knob, on && s.knobOn]} />
                  </Pressable>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`O que muda se desligar ${k.titulo}`}
                  onPress={() => setAberto(expandido ? null : k.id)}
                  style={s.maisLink}>
                  <Text style={s.maisTxt}>
                    {expandido ? 'Fechar' : 'Se eu desligar, o que muda?'}
                  </Text>
                  <Icon
                    name="chevron"
                    size={14}
                    color={c.lilac3}
                    strokeWidth={2.2}
                  />
                </Pressable>

                {expandido ? (
                  <View style={s.expandido}>
                    <Txt variant="body">{k.seRecusar}</Txt>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <Text style={s.secao}>Seus direitos</Text>
        <Block>
          {DIREITOS.map((d) => (
            <View key={d.art} style={s.direito}>
              <Icon name="check" size={15} color={c.yes} strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Txt variant="body">{d.txt}</Txt>
                <Text style={s.art}>{d.art}</Text>
              </View>
            </View>
          ))}
        </Block>

        <Block>
          <Text style={s.h}>Exercer um direito</Text>
          <Txt variant="body" style={s.p}>
            Baixar tudo o que temos, corrigir algo, pedir revisão de uma decisão automática
            ou qualquer outro item da lista acima. A resposta é gratuita.
          </Txt>
          <Button label="Baixar meus dados" kind="ghost" />
          <Button label="Pedir revisão de uma decisão" kind="ghost" />
        </Block>

        <Text style={s.secao}>Com quem compartilhamos</Text>
        <Block>
          <Linha
            titulo="Lojas parceiras"
            corpo="Ao tocar em “abrir na loja”, o link carrega um código de afiliado. A loja sabe que a visita veio do Aptum. Ela não recebe a sua lista nem o seu e-mail."
          />
          <Linha
            titulo="Serviço de notificação"
            corpo="O envio de push passa pelo serviço do sistema do seu celular. Com “ocultar nome do produto” ligado, o texto que sai daqui não contém o nome."
          />
          <Linha
            titulo="Infraestrutura"
            corpo="Servidores e banco de dados. Operam sob contrato, só executam o que pedimos e não usam os dados para nada próprio."
            ultima
          />
        </Block>

        <Block style={s.pendente}>
          <Text style={s.h}>Encarregado de dados (art. 41)</Text>
          <Txt variant="body" style={s.p}>
            A LGPD exige que este app publique o nome e o contato de quem responde pelas
            solicitações de titulares, além da razão social e do CNPJ do controlador.
          </Txt>
          <Txt variant="body" style={s.p}>
            <Text style={s.b}>Esses dados ainda não existem.</Text> Deixei o espaço marcado
            em vez de inventar um nome e um e-mail: uma política com contato falso não
            cumpre a lei e engana quem tentar usá-la.
          </Txt>
        </Block>

        <Txt variant="meta" style={s.fine}>
          Idade mínima de 18 anos. Dados de crianças e adolescentes têm regra própria
          (art. 14) e o Aptum não trata esses dados.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function Linha({ titulo, corpo, ultima }: { titulo: string; corpo: string; ultima?: boolean }) {
  const s = useS();
  return (
    <View style={[s.compart, !ultima && s.compartDiv]}>
      <Text style={s.itemTitulo}>{titulo}</Text>
      <Txt variant="body" style={{ marginTop: 2 }}>
        {corpo}
      </Txt>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  h: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  p: { marginTop: space.s2 },
  b: { fontFamily: font.uiBold, color: c.ink },

  secao: {
    fontFamily: font.dis,
    fontSize: size.t4,
    letterSpacing: -0.5,
    color: c.ink,
    marginTop: space.s5,
  },
  secaoNota: { marginTop: space.s2, marginBottom: space.s3 },

  grupo: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    marginBottom: space.s3,
    overflow: 'hidden',
  },
  item: { padding: space.s4 },
  itemDiv: { borderBottomWidth: 1, borderBottomColor: c.line },
  itemTopo: { flexDirection: 'row', gap: space.s3, alignItems: 'flex-start' },
  itemTitulo: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },

  maisLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    marginTop: space.s3,
    minHeight: 32,
  },
  maisTxt: { fontFamily: font.uiBold, fontSize: size.t1, color: c.lilac3 },
  expandido: {
    backgroundColor: c.wash,
    borderRadius: radius.r2,
    padding: space.s3,
    marginTop: space.s2,
  },

  sw: {
    width: 52,
    height: 31,
    borderRadius: 16,
    backgroundColor: c.line2,
    padding: 3,
    justifyContent: 'center',
  },
  swOn: { backgroundColor: c.yes },
  knob: { width: 25, height: 25, borderRadius: 13, backgroundColor: c.card },
  knobOn: { alignSelf: 'flex-end' },

  direito: {
    flexDirection: 'row',
    gap: space.s2,
    alignItems: 'flex-start',
    paddingVertical: space.s2,
  },
  art: {
    fontFamily: font.uiBold,
    fontSize: size.t0,
    color: c.ink3,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  compart: { paddingVertical: space.s3 },
  compartDiv: { borderBottomWidth: 1, borderBottomColor: c.line },

  pendente: { borderColor: c.maybe, borderWidth: 1.5 },

  fine: { marginTop: space.s4, lineHeight: 18 },
}));
