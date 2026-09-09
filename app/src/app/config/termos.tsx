import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Txt } from '@/components/primitives';
import { makeStyles } from '@/design/theme';
import { font, size, space } from '@/design/tokens';

/**
 * Termos de uso.
 *
 * Escrito no que o app faz de fato, não em fórmula de contrato. Onde falta
 * dado real — razão social, CNPJ, foro — está marcado como pendente em vez
 * de preenchido com invenção.
 *
 * Isto não é peça jurídica revisada.
 */
export default function Termos() {
  const s = useS();
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Termos de uso"
        subtitle="Rascunho — pendente de revisão jurídica"
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Block style={s.pendente}>
          <Txt variant="bodyStrong">Este texto ainda não vale como contrato.</Txt>
          <Txt variant="body" style={s.p}>
            Ele descreve corretamente o que o app faz, mas falta a identificação do
            controlador (razão social e CNPJ), o foro e a revisão de um advogado. Não
            preenchi esses campos com dados fictícios de propósito.
          </Txt>
        </Block>

        <Art n="1" t="O que o Aptum é">
          Um monitor de preço e um verificador de cupom para produtos de beleza. Ele observa
          o preço nas lojas, avisa quando cai e testa se um cupom vale para o seu produto
          específico. <Text style={s.b}>O Aptum não vende nada</Text> — a compra acontece no
          site da loja, sob as regras dela.
        </Art>

        <Art n="2" t="O que o Aptum não garante">
          Preço e disponibilidade mudam a qualquer momento e são da loja, não nossos. O
          valor mostrado aqui é o da última coleta, e o horário dela aparece junto. Um cupom
          marcado como <Text style={s.b}>vale</Text> foi verificado contra as regras
          publicadas, mas a loja pode alterá-las sem aviso. Sempre confira o total antes de
          finalizar.
        </Art>

        <Art n="3" t="Comissão por indicação">
          Quando você abre uma loja por um link nosso, o Aptum pode receber comissão sobre a
          compra. Isso <Text style={s.b}>nunca</Text> muda a ordem das lojas na tela: a
          lista é sempre por preço por unidade, e a loja com comissão não sobe por isso. O
          preço que você paga é o mesmo com ou sem o nosso link.
        </Art>

        <Art n="4" t="Decisões automáticas">
          O veredito de um cupom e a recomendação de esperar por uma data são calculados por
          máquina. Você tem direito a pedir revisão dessas decisões e a saber os critérios
          usados — LGPD, art. 20. O pedido se faz em Configurações › Privacidade e dados.
        </Art>

        <Art n="5" t="Conta e idade">
          A conta é pessoal e a senha é sua responsabilidade. A idade mínima é 18 anos: o
          Aptum não trata dados de crianças e adolescentes, que têm regime próprio na LGPD
          (art. 14).
        </Art>

        <Art n="6" t="Plano pago">
          O Aptum Mais é uma assinatura mensal, cancelável a qualquer momento e sem multa.
          Ao cancelar, os itens que passarem do limite do plano gratuito ficam{' '}
          <Text style={s.b}>pausados</Text>, não apagados — você escolhe quais continuam
          ativos, e o histórico de todos permanece. Cobranças seguem o Código de Defesa do
          Consumidor, incluindo o direito de arrependimento em 7 dias (art. 49).
        </Art>

        <Art n="7" t="Encerramento">
          Você pode apagar a conta quando quiser, em Configurações. A eliminação é imediata,
          salvo os registros de acesso que o Marco Civil da Internet obriga a guardar por 6
          meses (art. 15).
        </Art>

        <Art n="8" t="Mudanças nestes termos" ultima>
          Se algo mudar de forma relevante, avisamos dentro do app antes de valer, com prazo
          para você ler e decidir. Continuar usando depois disso significa aceitar.
        </Art>

        <Txt variant="meta" style={s.fine}>
          Última revisão: rascunho inicial. Versão do app 0.1.0.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function Art({
  n,
  t,
  children,
  ultima,
}: {
  n: string;
  t: string;
  children: React.ReactNode;
  ultima?: boolean;
}) {
  const s = useS();
  return (
    <View style={[s.art, !ultima && s.artDiv]}>
      <Text style={s.artTitulo}>
        {n}. {t}
      </Text>
      <Txt variant="body" style={s.p}>
        {children}
      </Txt>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  pendente: { borderColor: c.maybe, borderWidth: 1.5 },
  p: { marginTop: space.s2, lineHeight: 20 },
  b: { fontFamily: font.uiBold, color: c.ink },

  art: { paddingVertical: space.s4 },
  artDiv: { borderBottomWidth: 1, borderBottomColor: c.line },
  artTitulo: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },

  fine: { marginTop: space.s4 },
}));
