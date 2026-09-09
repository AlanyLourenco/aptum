import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Txt } from '@/components/primitives';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { useAptum } from '@/store/useAptum';

const PALAVRA = 'APAGAR';
const PASSOS = 4;

/**
 * Eliminação da conta — LGPD art. 18, VI.
 *
 * Quatro passos, e cada um existe por um motivo distinto:
 *
 *  1. O motivo. Metade das razões para sair tem conserto mais barato que
 *     apagar tudo, e a saída oferece esse conserto antes de continuar.
 *  2. O que se perde, com os números reais da conta dela.
 *  3. O que permanece, e por força de que lei.
 *  4. Confirmação dupla — digitar a palavra e marcar que entendeu.
 *
 * A lei manda que o caminho seja facilitado (art. 8º, §5º), não que seja
 * rápido: o que não pode é esconder o botão ou exigir justificativa. Aqui
 * nenhum passo é obrigatório de responder, e dá para pular direto para o
 * fim — os passos protegem de um toque errado, não impedem a saída.
 */

type Motivo = {
  id: string;
  label: string;
  /** o conserto mais barato que apagar tudo, quando existe */
  saida?: { txt: string; botao: string; rota: '/notificacoes' | '/planos' | '/config/privacidade' };
};

const MOTIVOS: Motivo[] = [
  {
    id: 'avisos',
    label: 'Recebo avisos demais',
    saida: {
      txt: 'Dá para baixar o teto para 3 por dia, ampliar o silêncio noturno ou mudar a sensibilidade para “só quando tenho certeza”. Leva dez segundos e não apaga nada.',
      botao: 'Ajustar os avisos',
      rota: '/notificacoes',
    },
  },
  {
    id: 'caro',
    label: 'Não quero pagar',
    saida: {
      txt: 'O plano gratuito não expira. Cancelar a assinatura mantém a conta, e os itens que passarem de 15 ficam pausados — não apagados.',
      botao: 'Ver os planos',
      rota: '/planos',
    },
  },
  {
    id: 'privacidade',
    label: 'Não quero mais compartilhar meus dados',
    saida: {
      txt: 'Você pode revogar cada consentimento separadamente e continuar usando o app. Só o essencial ao serviço fica.',
      botao: 'Ver consentimentos',
      rota: '/config/privacidade',
    },
  },
  { id: 'naouso', label: 'Não uso mais' },
  { id: 'outro', label: 'Outro motivo' },
];

export default function Apagar() {
  const s = useS();
  const c = useTheme();
  const router = useRouter();
  const apagarMeusDados = useAptum((st) => st.apagarMeusDados);
  const produtos = useAptum((st) => st.products.length);
  const compras = useAptum((st) => st.purchases.length);
  const listas = useAptum((st) => st.lists.length);

  const [passo, setPasso] = useState(1);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [entendi, setEntendi] = useState(false);
  const [feito, setFeito] = useState(false);

  const escolhido = MOTIVOS.find((m) => m.id === motivo);
  const podeApagar = texto.trim().toUpperCase() === PALAVRA && entendi;

  if (feito) {
    return (
      <SafeAreaView style={s.safe} edges={[]}>
        <ScreenHeader title="Conta apagada" />
        <View style={s.pronto}>
          <View style={s.prontoIcone}>
            <Icon name="check" size={28} color={c.yes} strokeWidth={2.4} />
          </View>
          <Text style={s.h}>Seus dados foram apagados.</Text>
          <Txt variant="body" style={s.p}>
            Listas, favoritos, histórico de compras e vereditos de cupom não existem mais.
            Registros de acesso ficam por 6 meses por exigência do Marco Civil da Internet
            (art. 15) e depois somem sozinhos.
          </Txt>
          <Button label="Voltar ao início" onPress={() => router.replace('/entrada')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Apagar minha conta"
        subtitle={`Passo ${passo} de ${PASSOS}`}
        onBack={() => (passo === 1 ? router.back() : setPasso(passo - 1))}
      />

      <View style={s.trilho}>
        {Array.from({ length: PASSOS }, (_, i) => (
          <View key={i} style={[s.degrau, i < passo && s.degrauFeito]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {passo === 1 ? (
          <>
            <Text style={s.titulo}>Por que você quer sair?</Text>
            <Txt variant="body" style={s.p}>
              Responder é opcional, e nada aqui te impede de continuar. Perguntamos porque
              algumas dessas coisas têm solução sem apagar nada.
            </Txt>

            <View style={{ gap: space.s2, marginTop: space.s4 }}>
              {MOTIVOS.map((m) => {
                const on = m.id === motivo;
                return (
                  <Pressable
                    key={m.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={m.label}
                    onPress={() => setMotivo(on ? null : m.id)}
                    style={({ pressed }) => [s.opt, on && s.optOn, pressed && { opacity: 0.9 }]}>
                    <View style={[s.radio, on && s.radioOn]}>
                      {on ? (
                        <Icon name="check" size={13} color={c.onPlum} strokeWidth={3} />
                      ) : null}
                    </View>
                    <Text style={[s.optTxt, on && { color: c.accent }]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {escolhido?.saida ? (
              <Block style={s.saida}>
                <Text style={s.h}>Talvez isto resolva</Text>
                <Txt variant="body" style={s.p}>
                  {escolhido.saida.txt}
                </Txt>
                <Button
                  label={escolhido.saida.botao}
                  onPress={() => router.push(escolhido.saida!.rota)}
                />
              </Block>
            ) : null}

            <Button label="Continuar mesmo assim" kind="ghost" onPress={() => setPasso(2)} />
          </>
        ) : null}

        {passo === 2 ? (
          <>
            <Text style={s.titulo}>O que some para sempre</Text>
            <Txt variant="body" style={s.p}>
              Não dá para recuperar depois. Se quiser guardar, baixe antes — é um direito
              seu (art. 18, V) e leva alguns segundos.
            </Txt>

            <Block style={{ marginTop: space.s4 }}>
              <Perda icone="list" txt={`${listas} listas e ${produtos} produtos monitorados`} />
              <Perda
                icone="clock"
                txt={`${compras} compras registradas e a economia calculada em cima delas`}
              />
              <Perda icone="tag" txt="Os cupons que você marcou como funcionaram" />
              <Perda icone="heart" txt="Seus tons salvos e os favoritos" />
              <Perda icone="bell" txt="Suas preferências de aviso" ultima />
            </Block>

            <Button label="Baixar meus dados antes" kind="ghost" />
            <Button label="Entendi, continuar" onPress={() => setPasso(3)} />
          </>
        ) : null}

        {passo === 3 ? (
          <>
            <Text style={s.titulo}>O que fica, e por quê</Text>
            <Txt variant="body" style={s.p}>
              Duas coisas não somem, e nenhuma delas é escolha nossa.
            </Txt>

            <Block style={{ marginTop: space.s4 }}>
              <Text style={s.h}>Registros de acesso, por 6 meses</Text>
              <Txt variant="body" style={s.p}>
                Data, hora e endereço IP. O Marco Civil da Internet (art. 15) obriga a
                guardar. Depois do prazo, somem automaticamente. Eles não incluem o que você
                monitorava.
              </Txt>
            </Block>

            <Block>
              <Text style={s.h}>O histórico de preços dos produtos</Text>
              <Txt variant="body" style={s.p}>
                Ele nunca foi seu: é do catálogo, vale para todo mundo e não identifica
                ninguém.
              </Txt>
            </Block>

            <Button label="Entendi, continuar" onPress={() => setPasso(4)} />
          </>
        ) : null}

        {passo === 4 ? (
          <>
            <Text style={[s.titulo, { color: c.up }]}>Confirmação final</Text>
            <Txt variant="body" style={s.p}>
              Depois de tocar no botão não existe desfazer, nem prazo de arrependimento, nem
              suporte que consiga recuperar.
            </Txt>

            <Block style={s.perigo}>
              <Text style={s.rotulo}>1. Digite {PALAVRA}</Text>
              <TextInput
                value={texto}
                onChangeText={(t) => setTexto(t.toUpperCase())}
                placeholder={PALAVRA}
                placeholderTextColor={c.ink3}
                style={s.input}
                autoCapitalize="characters"
                autoCorrect={false}
                accessibilityLabel={`Digite ${PALAVRA} para confirmar`}
              />

              <Text style={s.rotulo}>2. Marque que você entendeu</Text>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: entendi }}
                accessibilityLabel="Entendi que apagar a conta não tem volta"
                onPress={() => setEntendi((v) => !v)}
                style={({ pressed }) => [s.check, pressed && { opacity: 0.85 }]}>
                <View style={[s.box, entendi && s.boxOn]}>
                  {entendi ? (
                    <Icon name="check" size={14} color={c.onPlum} strokeWidth={3} />
                  ) : null}
                </View>
                <Txt variant="body" style={{ flex: 1 }}>
                  Entendi que isto apaga tudo e não tem volta.
                </Txt>
              </Pressable>

              <Button
                label="Apagar minha conta"
                disabled={!podeApagar}
                style={[s.btnPerigo, !podeApagar && s.off]}
                onPress={() => {
                  apagarMeusDados();
                  setFeito(true);
                }}
              />
              <Button label="Cancelar, quero ficar" kind="quiet" onPress={() => router.back()} />
            </Block>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Perda({ icone, txt, ultima }: { icone: IconName; txt: string; ultima?: boolean }) {
  const s = useS();
  const c = useTheme();
  return (
    <View style={[s.perda, !ultima && s.perdaDiv]}>
      <Icon name={icone} size={17} color={c.up} strokeWidth={1.9} />
      <Txt variant="body" style={{ flex: 1 }}>
        {txt}
      </Txt>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  trilho: { flexDirection: 'row', gap: space.s1, paddingHorizontal: space.s4 },
  degrau: { flex: 1, height: 3, borderRadius: 2, backgroundColor: c.line },
  degrauFeito: { backgroundColor: c.accent },

  titulo: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
    lineHeight: 30,
    marginTop: space.s5,
  },
  h: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  p: { marginTop: space.s2 },
  rotulo: {
    fontFamily: font.uiBold,
    fontSize: size.t0,
    color: c.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: space.s4,
  },

  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: radius.r2,
    padding: space.s3,
    minHeight: TAP,
  },
  optOn: { borderColor: c.plum4, backgroundColor: c.wash },
  optTxt: { flex: 1, fontFamily: font.uiSemi, fontSize: size.t3, color: c.ink },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: c.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: c.plum, borderColor: c.plum },

  saida: { borderColor: c.yes, borderWidth: 1.5, marginTop: space.s4 },

  perda: { flexDirection: 'row', gap: space.s3, alignItems: 'flex-start', paddingVertical: space.s3 },
  perdaDiv: { borderBottomWidth: 1, borderBottomColor: c.line },

  perigo: { borderColor: c.up, borderWidth: 1.5, marginTop: space.s4 },
  input: {
    fontFamily: font.disExtra,
    fontSize: size.t4,
    letterSpacing: 2,
    color: c.ink,
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.r2,
    paddingHorizontal: space.s3,
    marginTop: space.s2,
    minHeight: TAP,
  },
  check: {
    flexDirection: 'row',
    gap: space.s3,
    alignItems: 'flex-start',
    marginTop: space.s2,
    minHeight: TAP,
    paddingVertical: space.s2,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: c.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.plum, borderColor: c.plum },
  btnPerigo: { backgroundColor: c.up },
  off: { opacity: 0.4 },

  pronto: { flex: 1, padding: space.s5, justifyContent: 'center' },
  prontoIcone: {
    width: 56,
    height: 56,
    borderRadius: radius.r3,
    backgroundColor: c.yesBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s4,
  },
}));
