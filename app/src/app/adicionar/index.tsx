import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EscolherLista } from '@/components/EscolherLista';
import { Icon, IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl, popular, watchersLabel } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

export default function Buscar() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [q, setQ] = useState('');
  const products = useAptum((st) => st.products);

  const moveProduct = useAptum((st) => st.moveProduct);
  /** o produto fica em espera até ela dizer em que lista ele entra */
  const [entrando, setEntrando] = useState<{ id: string; nome: string } | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.includes(term),
    );
  }, [q, products]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Adicionar produto" onBack={() => router.back()} />

      <View style={s.searchBar}>
        <Icon name="search" size={18} color={c.ink3} strokeWidth={1.9} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Nome ou marca do produto"
          placeholderTextColor={c.ink3}
          style={s.input}
          autoFocus
          accessibilityLabel="Buscar produto por nome ou marca"
          returnKeyType="search"
        />
        {q.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            onPress={() => setQ('')}
            hitSlop={10}>
            <Icon name="close" size={17} color={c.ink3} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {q.trim().length === 0 ? (
          <>
            <Shortcut
              icon="scan"
              title="Escanear código de barras"
              body="Aponte para a embalagem do que você já tem em casa."
              onPress={() => router.push('/adicionar/escanear')}
            />
            <Shortcut
              icon="plus"
              title="Colar o link do produto"
              body="Copiou o endereço na loja? Cole aqui que a gente identifica."
              onPress={() => router.push('/adicionar/escanear')}
            />
            <Txt variant="meta" style={s.tip}>
              Dica: busque pela marca quando não lembrar o nome exato.
            </Txt>

            <View style={s.popHead}>
              <Text style={s.popTitle}>Mais monitorados</Text>
              <Text style={s.popMeta}>por quem usa o Aptum</Text>
            </View>

            {popular.map((p, i) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`${p.brand} ${p.name}, ${watchersLabel(p.watchers)} pessoas monitoram. Adicionar.`}
                onPress={() => setEntrando({ id: p.id, nome: `${p.brand} ${p.name}` })}
                style={({ pressed }) => [s.row, pressed && { borderColor: c.line2 }]}>
                <View style={s.shot}>
                  <Vessel name={p.vessel} size={44} />
                  <Text style={s.rank}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="brand">{p.brand}</Txt>
                  <Txt variant="bodyStrong" numberOfLines={2}>
                    {p.name} · {p.sizeLabel}
                  </Txt>
                  <Text style={s.price}>
                    {brl(p.price)} · {brl(p.perUnit)}/{p.unitLabel}
                  </Text>
                  <View style={s.popFoot}>
                    <Icon name="bell" size={12} color={c.ink3} strokeWidth={1.9} />
                    <Text style={s.watchers}>{watchersLabel(p.watchers)} monitorando</Text>
                    {p.trendPct ? (
                      <Text
                        style={[
                          s.trend,
                          { color: p.trendPct < 0 ? c.down : c.up },
                        ]}>
                        {p.trendPct < 0 ? '−' : '+'}
                        {Math.abs(p.trendPct)}% em 30 dias
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Icon name="plus" size={19} color={c.accent} strokeWidth={2.2} />
              </Pressable>
            ))}
          </>
        ) : results.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.center}>
              Não achamos “{q.trim()}”.
            </Txt>
            <Txt variant="body" style={[s.center, { marginTop: space.s2 }]}>
              Pode ser que ainda não esteja no nosso catálogo. Escaneie o código de barras ou
              cole o link da loja, que a gente cadastra.
            </Txt>
            <Button
              label="Escanear código de barras"
              kind="ghost"
              onPress={() => router.push('/adicionar/escanear')}
            />
          </View>
        ) : (
          <>
            <Text style={s.count}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </Text>
            {results.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Adicionar ${p.name}`}
                onPress={() =>
                  p.variant
                    ? router.push('/adicionar/tom')
                    : setEntrando({ id: p.id, nome: `${p.brand} ${p.name}` })
                }
                style={({ pressed }) => [s.row, pressed && { borderColor: c.line2 }]}>
                <View style={s.shot}>
                  <Vessel name={p.vessel} size={44} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="brand">{p.brand}</Txt>
                  <Txt variant="bodyStrong" numberOfLines={2}>
                    {p.name} · {p.sizeLabel}
                  </Txt>
                  <Text style={s.price}>
                    {brl(p.price)} · {brl(p.perUnit)}/{p.unitLabel}
                  </Text>
                  {p.variant ? (
                    <Text style={s.needsTone}>Tem {'18'} tons — você escolhe o seu</Text>
                  ) : null}
                </View>
                <Icon name="chevron" size={19} color={c.ink3} strokeWidth={2} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <EscolherLista
        open={entrando !== null}
        produto={entrando}
        onClose={() => setEntrando(null)}
        onPronto={(listaId) => {
          if (entrando) moveProduct(entrando.id, listaId);
          setEntrando(null);
          router.push({ pathname: '/lista/[id]', params: { id: listaId } });
        }}
      />
    </SafeAreaView>
  );
}

function Shortcut({
  icon,
  title,
  body,
  onPress,
}: {
  icon: IconName;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useS();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [s.shortcut, pressed && { borderColor: c.ink3 }]}>
      <View style={s.shortcutIcon}>
        <Icon name={icon} size={22} color={c.lilac3} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.shortcutTitle}>{title}</Text>
        <Txt variant="body" style={{ marginTop: 2 }}>
          {body}
        </Txt>
      </View>
      <Icon name="chevron" size={19} color={c.ink3} strokeWidth={2} />
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },
  center: { textAlign: 'center' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.pill,
    paddingHorizontal: space.s4,
    marginHorizontal: space.s4,
    marginTop: space.s2,
    minHeight: 52,
  },
  input: { flex: 1, fontFamily: font.ui, fontSize: size.t3, color: c.ink, paddingVertical: 0 },

  count: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    marginBottom: space.s3,
    fontVariant: ['tabular-nums'],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
    marginBottom: space.s3,
  },
  shot: {
    width: 64,
    height: 74,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    marginTop: space.s1,
    fontVariant: ['tabular-nums'],
  },
  needsTone: { fontFamily: font.uiBold, fontSize: size.t0, color: c.lilac3, marginTop: 2 },

  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s4,
    marginBottom: space.s3,
    minHeight: TAP,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.r2,
    backgroundColor: c.wash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },

  tip: { marginTop: space.s3, textAlign: 'center' },

  popHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space.s6,
    marginBottom: space.s3,
    paddingTop: space.s4,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  popTitle: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  popMeta: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink3 },
  /** a posição fica no canto da foto, não numa coluna à parte */
  rank: {
    position: 'absolute',
    top: 3,
    left: 5,
    fontFamily: font.uiExtra,
    fontSize: size.t0,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  popFoot: { flexDirection: 'row', alignItems: 'center', gap: space.s1, marginTop: space.s1 },
  watchers: {
    fontFamily: font.uiSemi,
    fontSize: size.t0,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  trend: {
    fontFamily: font.uiBold,
    fontSize: size.t0,
    marginLeft: space.s2,
    fontVariant: ['tabular-nums'],
  },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
  },
}));
