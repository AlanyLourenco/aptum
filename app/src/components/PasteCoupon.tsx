import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Button, IconButton, Txt } from '@/components/primitives';
import { coupons, products } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

type Result =
  | { kind: 'conhecido'; code: string; covers: number }
  | { kind: 'novo'; code: string }
  | null;

/**
 * Colar um cupom que ela recebeu por fora.
 *
 * Se já conhecemos o código, abrimos a ficha dele — o teste contra os
 * produtos dela já está feito. Se não, o código entra na fila: dizer
 * "vamos testar" é honesto, dizer "vale" sem ter verificado não é (D22).
 */
export function PasteCoupon({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useS();
  const c = useTheme();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Result>(null);

  const clean = code.trim().toUpperCase();
  const valid = clean.length >= 3;

  const close = () => {
    setCode('');
    setResult(null);
    onClose();
  };

  const test = () => {
    if (!valid) return;
    const known = coupons.find((c) => c.code.toUpperCase() === clean);
    if (known) {
      setResult({
        kind: 'conhecido',
        code: known.code,
        covers: products.filter((p) => known.covers.includes(p.id)).length,
      });
    } else {
      setResult({ kind: 'novo', code: clean });
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        style={s.scrim}
        onPress={close}
      />
      <View style={s.wrap}>
        <View style={s.sheet}>
          <View style={s.head}>
            <Text style={s.title}>Colar um cupom</Text>
            <IconButton name="close" label="Fechar" onPress={close} style={s.x} />
          </View>

          <Txt variant="body">
            Cupom de story, de grupo, de blogueira. A gente testa contra as suas listas e
            diz em quais produtos ele pega — antes de você chegar no caixa.
          </Txt>

          <TextInput
            value={code}
            /** maiúsculo no próprio valor: `autoCapitalize` é dica, e na web nem isso */
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setResult(null);
            }}
            placeholder="BELEZA20"
            placeholderTextColor={c.ink3}
            style={s.input}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={24}
            accessibilityLabel="Código do cupom"
            onSubmitEditing={test}
            returnKeyType="done"
          />

          {result?.kind === 'conhecido' ? (
            <View style={[s.result, { backgroundColor: c.yesBg }]}>
              <Icon name="check" size={16} color={c.yes} strokeWidth={2.2} />
              <Text style={[s.resultTxt, { color: c.yes }]}>
                Já testamos esse. Ele pega em {result.covers}{' '}
                {result.covers === 1 ? 'produto seu' : 'produtos seus'}.
              </Text>
            </View>
          ) : result?.kind === 'novo' ? (
            <View style={[s.result, { backgroundColor: c.maybeBg }]}>
              <Icon name="question" size={16} color={c.maybe} strokeWidth={2.2} />
              <Text style={[s.resultTxt, { color: c.maybe }]}>
                Ainda não conhecemos {result.code}. Entrou na fila — testamos contra os seus
                produtos e avisamos só se valer.
              </Text>
            </View>
          ) : null}

          {result?.kind === 'conhecido' ? (
            <Button
              label="Ver o cupom"
              onPress={() => {
                const to = result.code;
                close();
                router.push({ pathname: '/cupom/[code]', params: { code: to } });
              }}
            />
          ) : (
            <Button
              label={result?.kind === 'novo' ? 'Pronto' : 'Testar o código'}
              onPress={result?.kind === 'novo' ? close : test}
              disabled={!valid}
              style={!valid && s.off}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const useS = makeStyles((c) => ({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27,20,32,0.45)',
  },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    padding: space.s4,
    paddingBottom: space.s7,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: space.s2 },
  title: {
    flex: 1,
    fontFamily: font.dis,
    fontSize: size.t5,
    letterSpacing: -0.7,
    color: c.ink,
  },
  x: { marginRight: -space.s2 },

  input: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    letterSpacing: 1.4,
    color: c.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: c.line2,
    paddingVertical: space.s2,
    marginTop: space.s4,
    minHeight: TAP,
  },

  result: {
    flexDirection: 'row',
    gap: space.s2,
    alignItems: 'flex-start',
    borderRadius: radius.r2,
    padding: space.s3,
    marginTop: space.s4,
  },
  resultTxt: { flex: 1, fontFamily: font.uiSemi, fontSize: size.t2, lineHeight: 18 },

  off: { opacity: 0.4 },
}));
