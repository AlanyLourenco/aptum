import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, CheckLine, Txt } from '@/components/primitives';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space, TAP } from '@/design/tokens';

/** As regras aparecem antes de ela digitar, e cada uma acende sozinha. */
function forca(v: string) {
  return {
    tamanho: v.length >= 10,
    variedade: /[a-zA-Z]/.test(v) && /\d/.test(v),
    semObvio: v.length > 0 && !/^(senha|123|aptum|qwerty)/i.test(v),
  };
}

export default function Acesso() {
  const s = useS();
  const c = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('alanygabi@gmail.com');
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [ver, setVer] = useState(false);

  const regras = forca(nova);
  const podeTrocar = atual.length > 0 && Object.values(regras).every(Boolean);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="E-mail e senha" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Block>
          <Text style={s.h}>E-mail</Text>
          <Txt variant="body" style={s.p}>
            É por onde você entra e recupera a conta. Ao trocar, mandamos um link de
            confirmação para o endereço novo — o antigo continua valendo até você confirmar.
          </Txt>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={s.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Endereço de e-mail"
          />
          <Button label="Trocar o e-mail" kind="ghost" />
        </Block>

        <Block>
          <Text style={s.h}>Senha</Text>
          <Txt variant="body" style={s.p}>
            Pedimos a atual porque trocar senha sem ela permitiria que alguém com o seu
            celular destrancado assumisse a conta.
          </Txt>

          <Text style={s.rotulo}>Senha atual</Text>
          <TextInput
            value={atual}
            onChangeText={setAtual}
            style={s.input}
            secureTextEntry
            autoCapitalize="none"
            accessibilityLabel="Senha atual"
          />

          <Text style={s.rotulo}>Senha nova</Text>
          <View style={s.campoLinha}>
            <TextInput
              value={nova}
              onChangeText={setNova}
              style={[s.input, { flex: 1 }]}
              secureTextEntry={!ver}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Senha nova"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={ver ? 'Esconder a senha' : 'Mostrar a senha'}
              onPress={() => setVer((v) => !v)}
              hitSlop={10}
              style={s.olho}>
              <Icon name={ver ? 'close' : 'search'} size={18} color={c.ink3} strokeWidth={1.9} />
            </Pressable>
          </View>

          <View style={s.regras}>
            <CheckLine state={regras.tamanho ? 'yes' : 'no'}>
              Pelo menos 10 caracteres
            </CheckLine>
            <CheckLine state={regras.variedade ? 'yes' : 'no'}>
              Mistura letras e números
            </CheckLine>
            <CheckLine state={regras.semObvio ? 'yes' : 'no'}>
              Não começa com algo óbvio
            </CheckLine>
          </View>

          <Button label="Trocar a senha" disabled={!podeTrocar} style={!podeTrocar && s.off} />
        </Block>

        <Block>
          <Text style={s.h}>Sessões abertas</Text>
          <Txt variant="body" style={s.p}>
            Trocar a senha encerra o acesso em todos os aparelhos, menos neste. É o caminho
            se você acha que alguém entrou na sua conta.
          </Txt>
          <View style={s.sessao}>
            <Icon name="user" size={18} color={c.ink3} strokeWidth={1.9} />
            <View style={{ flex: 1 }}>
              <Text style={s.sessaoNome}>Este aparelho</Text>
              <Txt variant="meta">Android · agora</Txt>
            </View>
          </View>
        </Block>

        <Txt variant="meta" style={s.fine}>
          Nunca pedimos a sua senha por e-mail nem por mensagem. Se alguém pedir, não é o
          Aptum.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

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

  campoLinha: { flexDirection: 'row', alignItems: 'center', gap: space.s2 },
  olho: { width: TAP, height: TAP, alignItems: 'center', justifyContent: 'center' },
  input: {
    fontFamily: font.uiSemi,
    fontSize: size.t3,
    color: c.ink,
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.r2,
    paddingHorizontal: space.s3,
    paddingVertical: space.s2,
    marginTop: space.s2,
    minHeight: TAP,
  },

  regras: { gap: space.s2, marginTop: space.s3 },
  off: { opacity: 0.4 },

  sessao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    marginTop: space.s3,
    paddingTop: space.s3,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  sessaoNome: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink },

  fine: { marginTop: space.s3, lineHeight: 18 },
}));
