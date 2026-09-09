import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, IconButton, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { useAptum } from '@/store/useAptum';

/**
 * Onde este produto vai.
 *
 * Aparece no momento de adicionar, porque é aí que a decisão é barata: a
 * pessoa acabou de escolher o produto e sabe para que ele serve. Perguntar
 * depois vira faxina, e faxina ninguém faz.
 *
 * A lista nova se cria daqui mesmo — mandar para outra tela no meio do
 * fluxo perderia o produto que ela acabou de achar.
 */
export function EscolherLista({
  open,
  produto,
  onClose,
  onPronto,
}: {
  open: boolean;
  /** id e nome do produto que está entrando */
  produto: { id: string; nome: string } | null;
  onClose: () => void;
  onPronto: (listaId: string) => void;
}) {
  const s = useS();
  const c = useTheme();
  const listas = useAptum((st) => st.lists);
  const createList = useAptum((st) => st.createList);

  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'reposicao' | 'desejo'>('reposicao');

  const nomeValido = nome.trim().length >= 2;
  const pode = criando ? nomeValido : escolhida !== null;

  const fechar = () => {
    setEscolhida(null);
    setCriando(false);
    setNome('');
    onClose();
  };

  const confirmar = () => {
    if (!pode) return;
    const id = criando ? createList(nome.trim(), tipo) : escolhida!;
    fechar();
    onPronto(id);
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={fechar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        style={s.scrim}
        onPress={fechar}
      />
      <View style={s.wrap}>
        <View style={s.sheet}>
          <View style={s.head}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Em qual lista?</Text>
              {produto ? (
                <Txt variant="body" numberOfLines={1} style={{ marginTop: 2 }}>
                  {produto.nome}
                </Txt>
              ) : null}
            </View>
            <IconButton name="close" label="Fechar" onPress={fechar} style={s.x} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.corpo}>
            {!criando &&
              listas.map((l) => {
                const on = !criando && escolhida === l.id;
                return (
                  <Pressable
                    key={l.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${l.name}, ${l.count} itens. ${l.rule}`}
                    onPress={() => {
                      setCriando(false);
                      setEscolhida(l.id);
                    }}
                    style={({ pressed }) => [s.opt, on && s.optOn, pressed && { opacity: 0.9 }]}>
                    <View style={s.frascos}>
                      {l.vessels.slice(0, 2).map((v, i) => (
                        <Vessel key={`${v}-${i}`} name={v} size={22} />
                      ))}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.optTitle, on && { color: c.accent }]}>{l.name}</Text>
                      <Txt variant="meta" numberOfLines={1}>
                        {l.count} itens · {l.rule}
                      </Txt>
                    </View>
                    <View style={[s.radio, on && s.radioOn]}>
                      {on ? <Icon name="check" size={13} color={c.onPlum} strokeWidth={3} /> : null}
                    </View>
                  </Pressable>
                );
              })}

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: criando }}
              accessibilityLabel={
                criando ? 'Voltar e escolher uma lista existente' : 'Criar uma lista nova'
              }
              onPress={() => {
                setCriando(!criando);
                setEscolhida(null);
              }}
              style={({ pressed }) => [
                s.opt,
                s.nova,
                criando && s.optOn,
                pressed && { opacity: 0.9 },
              ]}>
              <View style={s.maisIcone}>
                <Icon name="plus" size={18} color={c.accent} strokeWidth={2.2} />
              </View>
              <Text style={[s.optTitle, { flex: 1 }, criando && { color: c.accent }]}>
                {criando ? 'Lista nova' : 'Criar uma lista nova'}
              </Text>
              {criando ? (
                <Text style={s.voltar}>usar uma existente</Text>
              ) : null}
            </Pressable>

            {criando ? (
              <View style={s.form}>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Presentes de Natal"
                  placeholderTextColor={c.ink3}
                  style={s.input}
                  autoFocus
                  maxLength={32}
                  accessibilityLabel="Nome da lista nova"
                />
                <View style={s.tipos}>
                  {(
                    [
                      { k: 'reposicao', t: 'Reposição', b: 'avisa quando está barato e você precisa' },
                      { k: 'desejo', t: 'Desejo', b: 'avisa só no melhor preço já visto' },
                    ] as const
                  ).map((o) => {
                    const on = tipo === o.k;
                    return (
                      <Pressable
                        key={o.k}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${o.t}: ${o.b}`}
                        onPress={() => setTipo(o.k)}
                        style={({ pressed }) => [
                          s.tipo,
                          on && s.tipoOn,
                          pressed && { opacity: 0.9 },
                        ]}>
                        <Text style={[s.tipoTitle, on && { color: c.accent }]}>{o.t}</Text>
                        <Txt variant="meta" style={{ marginTop: 1 }}>
                          {o.b}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <Button
            label={criando ? 'Criar e adicionar' : 'Adicionar'}
            onPress={confirmar}
            disabled={!pode}
            style={!pode && s.off}
          />
        </View>
      </View>
    </Modal>
  );
}

const useS = makeStyles((c) => ({
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    padding: space.s4,
    paddingBottom: space.s7,
    maxHeight: '86%',
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.s3 },
  title: { fontFamily: font.dis, fontSize: size.t5, letterSpacing: -0.7, color: c.ink },
  x: { marginRight: -space.s2 },
  corpo: { marginBottom: space.s2 },

  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderWidth: 1.5,
    borderColor: c.line,
    backgroundColor: c.card,
    borderRadius: radius.r2,
    padding: space.s3,
    marginBottom: space.s2,
    minHeight: TAP + 12,
  },
  optOn: { borderColor: c.plum4, backgroundColor: c.wash },
  optTitle: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  frascos: {
    flexDirection: 'row',
    width: 46,
    height: 46,
    borderRadius: radius.r1,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  nova: { borderStyle: 'dashed', borderColor: c.line2, backgroundColor: 'transparent' },
  maisIcone: {
    width: 46,
    height: 46,
    borderRadius: radius.r1,
    backgroundColor: c.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },

  voltar: { fontFamily: font.uiBold, fontSize: size.t1, color: c.lilac3 },
  form: { marginBottom: space.s2 },
  input: {
    fontFamily: font.uiSemi,
    fontSize: size.t3,
    color: c.ink,
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.r2,
    paddingHorizontal: space.s3,
    minHeight: TAP,
  },
  tipos: { flexDirection: 'row', gap: space.s2, marginTop: space.s2 },
  tipo: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: radius.r2,
    padding: space.s3,
  },
  tipoOn: { borderColor: c.plum4, backgroundColor: c.wash },
  tipoTitle: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink },

  off: { opacity: 0.4 },
}));
