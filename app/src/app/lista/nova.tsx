import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Txt } from '@/components/primitives';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

const KINDS = [
  {
    key: 'reposicao' as const,
    title: 'Reposição',
    body: 'Para o que você recompra. O aviso cruza o preço com o momento em que vai acabar.',
  },
  {
    key: 'desejo' as const,
    title: 'Desejo',
    body: 'Para o que você quer comprar. O aviso só dispara no melhor preço já visto ou no seu preço-alvo.',
  },
];

export default function NovaLista() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const createList = useAptum((st) => st.createList);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<'reposicao' | 'desejo'>('desejo');

  const valid = name.trim().length >= 2;

  const create = () => {
    if (!valid) return;
    const id = createList(name.trim(), kind);
    router.replace({ pathname: '/lista/[id]', params: { id } });
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Nova lista" backIcon="close" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Block>
          <Text style={s.label}>Nome da lista</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Presentes de Natal"
            placeholderTextColor={c.ink3}
            style={s.input}
            autoFocus
            maxLength={32}
            accessibilityLabel="Nome da lista"
          />
          <Txt variant="meta" style={{ marginTop: space.s2 }}>
            {name.trim().length < 2
              ? 'Pelo menos duas letras.'
              : `${32 - name.length} caracteres restantes`}
          </Txt>
        </Block>

        <Block>
          <Text style={s.label}>Como esta lista avisa</Text>
          <View style={{ gap: space.s2, marginTop: space.s3 }}>
            {KINDS.map((k) => {
              const on = k.key === kind;
              return (
                <Pressable
                  key={k.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${k.title}. ${k.body}`}
                  onPress={() => setKind(k.key)}
                  style={({ pressed }) => [s.kind, on && s.kindOn, pressed && { opacity: 0.9 }]}>
                  <View style={[s.radio, on && s.radioOn]}>
                    {on ? <Icon name="check" size={13} color={c.onPlum} strokeWidth={3} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.kindTitle, on && { color: c.accent }]}>{k.title}</Text>
                    <Txt variant="body" style={{ marginTop: 2 }}>
                      {k.body}
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Block>

        <Button label="Criar lista" onPress={create} disabled={!valid} style={!valid && s.off} />
        <Txt variant="meta" style={s.fine}>
          Dá para mudar o nome e a regra depois. Itens não se perdem ao trocar de lista.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  label: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  input: {
    fontFamily: font.uiSemi,
    fontSize: size.t4,
    color: c.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: c.line2,
    paddingVertical: space.s2,
    marginTop: space.s3,
    minHeight: TAP,
  },

  kind: {
    flexDirection: 'row',
    gap: space.s3,
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: radius.r2,
    padding: space.s3,
  },
  kindOn: { borderColor: c.plum, backgroundColor: c.wash },
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
  kindTitle: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },

  off: { opacity: 0.4 },
  fine: { marginTop: space.s3, textAlign: 'center', lineHeight: 18 },
}));
