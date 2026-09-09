import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Txt } from '@/components/primitives';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space, TAP } from '@/design/tokens';
import {
  apenasDigitos,
  duracaoSilencio,
  horaParaMinutos,
  mascaraHora,
  minutosParaHora,
} from '@/lib/mascaras';
import { AVISOS_PADRAO, SENSIBILIDADES, useAptum } from '@/store/useAptum';

/** Sugestões: atalho para o comum, sem virar a única opção. */
const TETOS = [3, 5, 8, 12];
const INICIOS = [21 * 60, 22 * 60, 22 * 60 + 30, 23 * 60];
const FINS = [6 * 60, 7 * 60, 7 * 60 + 30, 8 * 60];

/**
 * Como o app avisa.
 *
 * Tudo já vem decidido: 5 por dia, silêncio das 22h às 8h, nome do produto
 * escondido na tela bloqueada, sensibilidade equilibrada. Ela abre esta
 * tela só se quiser mudar — e cada opção diz o que faz, porque "sensibilidade
 * equilibrada" sem explicação não é uma escolha, é um chute.
 */
export default function Notificacoes() {
  const s = useS();
  const c = useTheme();
  const router = useRouter();
  const avisos = useAptum((st) => st.avisos);
  const setAviso = useAptum((st) => st.setAviso);
  const resetAvisos = useAptum((st) => st.resetAvisos);

  /**
   * Os campos guardam texto, não número: enquanto ela digita "2" o valor
   * ainda não é uma hora válida, e escrever isso no estado apagaria o que
   * estava lá. Só vira número quando o campo completa ou perde o foco.
   */
  const [teto, setTeto] = useState(String(avisos.tetoPorDia));
  const [de, setDe] = useState(minutosParaHora(avisos.silencioDe));
  const [ate, setAte] = useState(minutosParaHora(avisos.silencioAte));

  /** o reset mexe no estado global e nos campos de uma vez só */
  const voltarAoPadrao = () => {
    resetAvisos();
    setTeto(String(AVISOS_PADRAO.tetoPorDia));
    setDe(minutosParaHora(AVISOS_PADRAO.silencioDe));
    setAte(minutosParaHora(AVISOS_PADRAO.silencioAte));
  };

  const aplicarTeto = () => {
    const n = Number(teto);
    // fora da faixa volta para o que estava: nada de teto 0 nem 99
    if (!n || n < 1 || n > 30) setTeto(String(avisos.tetoPorDia));
    else setAviso('tetoPorDia', n);
  };

  const aplicarHora = (
    chave: 'silencioDe' | 'silencioAte',
    txt: string,
    repor: (v: string) => void,
  ) => {
    const m = horaParaMinutos(txt);
    if (m === null) repor(minutosParaHora(avisos[chave]));
    else setAviso(chave, m);
  };

  const noPadrao =
    avisos.tetoPorDia === AVISOS_PADRAO.tetoPorDia &&
    avisos.silencioAtivo === AVISOS_PADRAO.silencioAtivo &&
    avisos.silencioDe === AVISOS_PADRAO.silencioDe &&
    avisos.silencioAte === AVISOS_PADRAO.silencioAte &&
    avisos.ocultarNome === AVISOS_PADRAO.ocultarNome &&
    avisos.sensibilidade === AVISOS_PADRAO.sensibilidade;

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Notificações"
        subtitle={noPadrao ? 'No padrão' : 'Ajustada por você'}
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Block>
          <Text style={s.h}>Quantos avisos por dia, no máximo</Text>
          <Txt variant="body" style={s.body}>
            O teto vale para o dia inteiro. Passando dele, o resto vira um resumo só, na
            manhã seguinte — nada se perde.
          </Txt>
          <View style={s.campoLinha}>
            <TextInput
              value={teto}
              onChangeText={(t) => setTeto(apenasDigitos(t, 2))}
              onBlur={aplicarTeto}
              onSubmitEditing={aplicarTeto}
              style={s.numero}
              keyboardType="number-pad"
              maxLength={2}
              accessibilityLabel="Quantos avisos por dia, no máximo"
            />
            <Text style={s.unidade}>por dia</Text>
          </View>
          <View style={s.chips}>
            {TETOS.map((n) => (
              <Chip
                key={n}
                label={String(n)}
                on={avisos.tetoPorDia === n}
                onPress={() => {
                  setTeto(String(n));
                  setAviso('tetoPorDia', n);
                }}
              />
            ))}
          </View>
        </Block>

        <Block>
          <View style={s.rowHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.h}>Silêncio</Text>
              <Txt variant="body" style={s.body}>
                Nesse intervalo nada toca nem vibra. Os avisos ficam guardados e chegam
                quando o silêncio acabar.
              </Txt>
            </View>
            <Switch
              on={avisos.silencioAtivo}
              label="Silêncio noturno"
              onPress={() => setAviso('silencioAtivo', !avisos.silencioAtivo)}
            />
          </View>

          {avisos.silencioAtivo ? (
            <>
              <View style={s.horas}>
                <CampoHora
                  rotulo="Começa"
                  valor={de}
                  onTexto={setDe}
                  onFim={() => aplicarHora('silencioDe', de, setDe)}
                  sugestoes={INICIOS}
                  atual={avisos.silencioDe}
                  onSugestao={(m) => {
                    setDe(minutosParaHora(m));
                    setAviso('silencioDe', m);
                  }}
                />
                <CampoHora
                  rotulo="Termina"
                  valor={ate}
                  onTexto={setAte}
                  onFim={() => aplicarHora('silencioAte', ate, setAte)}
                  sugestoes={FINS}
                  atual={avisos.silencioAte}
                  onSugestao={(m) => {
                    setAte(minutosParaHora(m));
                    setAviso('silencioAte', m);
                  }}
                />
              </View>
              <Txt variant="meta" style={{ marginTop: space.s3 }}>
                {duracaoSilencio(avisos.silencioDe, avisos.silencioAte)} de silêncio.
              </Txt>
            </>
          ) : null}
        </Block>

        <Block>
          <View style={s.rowHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.h}>Ocultar o nome do produto</Text>
              <Txt variant="body" style={s.body}>
                Na tela bloqueada o aviso diz só “um item da sua lista caiu de preço”. Quem
                olhar o seu celular não vê que tratamento você usa.
              </Txt>
            </View>
            <Switch
              on={avisos.ocultarNome}
              label="Ocultar nome do produto"
              onPress={() => setAviso('ocultarNome', !avisos.ocultarNome)}
            />
          </View>
        </Block>

        <Block>
          <Text style={s.h}>Sensibilidade</Text>
          <Txt variant="body" style={s.body}>
            É o quanto o app precisa ter certeza antes de te incomodar. Mais sensível
            significa saber antes e errar mais vezes; menos sensível significa só o que
            está confirmado.
          </Txt>
          <View style={{ gap: space.s2, marginTop: space.s3 }}>
            {SENSIBILIDADES.map((o) => {
              const on = o.key === avisos.sensibilidade;
              return (
                <Pressable
                  key={o.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${o.label}. ${o.body}`}
                  onPress={() => setAviso('sensibilidade', o.key)}
                  style={({ pressed }) => [s.opt, on && s.optOn, pressed && { opacity: 0.9 }]}>
                  <View style={[s.radio, on && s.radioOn]}>
                    {on ? <Icon name="check" size={13} color={c.onPlum} strokeWidth={3} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.optTitle, on && { color: c.accent }]}>{o.label}</Text>
                    <Txt variant="body" style={{ marginTop: 2 }}>
                      {o.body}
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Block>

        {noPadrao ? (
          <Txt variant="meta" style={s.fine}>
            Estas são as configurações padrão. Você não precisa mexer em nada.
          </Txt>
        ) : (
          <Button label="Voltar ao padrão" kind="ghost" onPress={voltarAoPadrao} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Um horário: campo com máscara em cima, sugestões embaixo. */
function CampoHora({
  rotulo,
  valor,
  onTexto,
  onFim,
  sugestoes,
  atual,
  onSugestao,
}: {
  rotulo: string;
  valor: string;
  onTexto: (v: string) => void;
  onFim: () => void;
  sugestoes: number[];
  atual: number;
  onSugestao: (m: number) => void;
}) {
  const s = useS();
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={(t) => onTexto(mascaraHora(t))}
        onBlur={onFim}
        onSubmitEditing={onFim}
        placeholder="--:--"
        style={s.hora}
        keyboardType="number-pad"
        maxLength={5}
        accessibilityLabel={`${rotulo}, hora e minuto`}
      />
      <View style={s.chips}>
        {sugestoes.map((m) => (
          <Chip
            key={m}
            label={minutosParaHora(m)}
            on={atual === m}
            onPress={() => onSugestao(m)}
          />
        ))}
      </View>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const s = useS();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.chip, on && s.chipOn, pressed && { opacity: 0.85 }]}>
      <Text style={[s.chipTxt, on && s.chipTxtOn]}>{label}</Text>
    </Pressable>
  );
}

function Switch({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  const s = useS();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [s.sw, on && s.swOn, pressed && { opacity: 0.8 }]}>
      <View style={[s.knob, on && s.knobOn]} />
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  h: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  body: { marginTop: space.s2 },
  rotulo: {
    fontFamily: font.uiBold,
    fontSize: size.t0,
    color: c.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: space.s2,
  },
  rowHead: { flexDirection: 'row', gap: space.s3, alignItems: 'flex-start' },
  horas: { flexDirection: 'row', gap: space.s3, marginTop: space.s4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginTop: space.s3 },

  /** o campo é o principal; as fichas embaixo são atalho, não a única via */
  campoLinha: { flexDirection: 'row', alignItems: 'center', gap: space.s3, marginTop: space.s4 },
  numero: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.r2,
    paddingHorizontal: space.s3,
    minWidth: 84,
    minHeight: 56,
    textAlign: 'center',
  },
  unidade: { fontFamily: font.uiSemi, fontSize: size.t3, color: c.ink3 },
  hora: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.r2,
    paddingHorizontal: space.s3,
    minHeight: 52,
    marginTop: space.s2,
    textAlign: 'center',
  },
  chip: {
    minWidth: 46,
    minHeight: 38,
    paddingHorizontal: space.s3,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: c.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: c.plum, borderColor: c.plum },
  chipTxt: {
    fontFamily: font.uiBold,
    fontSize: size.t2,
    color: c.ink2,
    fontVariant: ['tabular-nums'],
  },
  chipTxtOn: { color: c.onPlum },

  opt: {
    flexDirection: 'row',
    gap: space.s3,
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: radius.r2,
    padding: space.s3,
    minHeight: TAP,
  },
  optOn: { borderColor: c.plum, backgroundColor: c.wash },
  optTitle: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: c.line2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOn: { backgroundColor: c.plum, borderColor: c.plum },

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

  fine: { marginTop: space.s4, textAlign: 'center', lineHeight: 18 },
}));
