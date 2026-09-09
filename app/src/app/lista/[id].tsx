import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, IconButton, Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

export default function ListaDetalhe() {
  const c = useTheme();
  const s = useS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const list = useAptum((st) => st.lists.find((l) => l.id === id));
  const products = useAptum(
    useShallow((st) => st.products.filter((p) => (id === 'rotina' ? p.inRoutine : !p.inRoutine))),
  );
  const removeProduct = useAptum((st) => st.removeProduct);
  const addToBag = useAptum((st) => st.addToBag);
  const bagIds = useAptum(useShallow((st) => st.bag.map((b) => b.productId)));

  if (!list) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.missing}>
          <Txt variant="bodyStrong">Essa lista não existe mais.</Txt>
          <Button label="Voltar" kind="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title={list.name}
        subtitle={list.rule}
        onBack={() => router.back()}
        right={
          <IconButton
            name="plus"
            label="Adicionar produto a esta lista"
            onPress={() => router.push('/adicionar')}
          />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {products.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.center}>
              {list.kind === 'desejo'
                ? 'Nada aqui ainda.'
                : 'Sua rotina está vazia.'}
            </Txt>
            <Txt variant="body" style={[s.center, { marginTop: space.s2 }]}>
              {list.kind === 'desejo'
                ? 'Adicione aquele perfume que você quer quando baixar. A gente avisa só no melhor preço já visto.'
                : 'Adicione o que você recompra sempre. A gente cruza o preço com o momento em que vai acabar.'}
            </Txt>
            <Button label="Adicionar produto" onPress={() => router.push('/adicionar')} />
          </View>
        ) : (
          products.map((p) => {
            const inBag = bagIds.includes(p.id);
            return (
              <View key={p.id} style={s.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${p.name}`}
                  onPress={() => router.push({ pathname: '/produto/[id]', params: { id: p.id } })}
                  style={s.rowMain}>
                  <View style={s.shot}>
                    <Vessel name={p.vessel} size={44} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="brand">{p.brand}</Txt>
                    <Txt variant="bodyStrong" numberOfLines={2}>
                      {p.name} · {p.sizeLabel}
                    </Txt>
                    {p.variant ? (
                      <View style={s.tone}>
                        <View style={[s.swatch, { backgroundColor: p.variant.swatch }]} />
                        <Text style={s.toneTxt}>
                          {p.variant.code} {p.variant.name}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={s.price}>
                      {brl(p.price)} · {brl(p.perUnit)}/{p.unitLabel}
                    </Text>
                    {p.runsOutInDays ? (
                      <Seal
                        tone="maybe"
                        icon="clock"
                        label={`Acaba em ${p.runsOutInDays} dias`}
                        style={{ marginTop: space.s2 }}
                      />
                    ) : null}
                  </View>
                </Pressable>

                <View style={s.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: inBag }}
                    accessibilityLabel={
                      inBag ? `${p.name} já está em vou levar` : `Marcar ${p.name} como vou levar`
                    }
                    onPress={() => addToBag(p.id)}
                    disabled={inBag}
                    style={({ pressed }) => [s.act, pressed && { backgroundColor: c.wash }]}>
                    <Icon
                      name="bag"
                      size={19}
                      color={inBag ? c.yes : c.ink3}
                      strokeWidth={1.8}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Tirar ${p.name} da lista`}
                    onPress={() => removeProduct(p.id)}
                    style={({ pressed }) => [s.act, pressed && { backgroundColor: c.wash }]}>
                    <Icon name="close" size={19} color={c.ink3} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },
  center: { textAlign: 'center' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  row: {
    flexDirection: 'row',
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    marginBottom: space.s3,
    overflow: 'hidden',
  },
  rowMain: { flex: 1, flexDirection: 'row', gap: space.s3, padding: space.s3 },
  shot: {
    width: 64,
    height: 74,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tone: { flexDirection: 'row', alignItems: 'center', gap: space.s1, marginTop: 2 },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  toneTxt: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2 },
  price: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    marginTop: space.s1,
    fontVariant: ['tabular-nums'],
  },

  actions: { borderLeftWidth: 1, borderLeftColor: c.line },
  act: { width: TAP, flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: TAP },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
  },
}));
