import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Txt } from '@/components/primitives';
import { makeStyles, THEMES, useTheme } from '@/design/theme';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { minutosParaHora } from '@/lib/mascaras';
import { useAptum } from '@/store/useAptum';

const VERSAO = '0.1.0 (desenvolvimento)';

export default function Config() {
  const s = useS();
  const c = useTheme();
  const router = useRouter();
  const tema = useAptum((st) => st.theme);
  const setTheme = useAptum((st) => st.setTheme);
  const avisos = useAptum((st) => st.avisos);

  const temaAtual = THEMES.find((t) => t.key === tema)!;

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Configurações" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Secao titulo="Conta" />
        <Grupo>
          <Linha
            icone="user"
            titulo="alanygabi@gmail.com"
            corpo="Endereço de acesso e de recuperação"
            valor="Alterar"
            onPress={() => router.push('/config/acesso')}
          />
          <Linha
            icone="lock"
            titulo="Senha"
            corpo="Alterada pela última vez há 3 meses"
            valor="Alterar"
            onPress={() => router.push('/config/acesso')}
            ultima
          />
        </Grupo>

        <Secao titulo="Aparência" />
        <Grupo>
          <View style={s.temaBox}>
            <Text style={s.temaTitulo}>Tema</Text>
            <Txt variant="body" style={{ marginTop: 2 }}>
              {temaAtual.body}
            </Txt>
            <View style={s.segment}>
              {THEMES.map((t) => {
                const on = t.key === tema;
                return (
                  <Pressable
                    key={t.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${t.label}. ${t.body}`}
                    onPress={() => setTheme(t.key)}
                    style={({ pressed }) => [
                      s.segItem,
                      on && s.segItemOn,
                      pressed && { opacity: 0.85 },
                    ]}>
                    <Text style={[s.segTxt, on && s.segTxtOn]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Grupo>

        <Secao titulo="Notificações" />
        <Grupo>
          <Linha
            icone="bell"
            titulo="Como o app avisa"
            corpo={`Até ${avisos.tetoPorDia} por dia${
              avisos.silencioAtivo
                ? `, silêncio das ${minutosParaHora(avisos.silencioDe)} às ${minutosParaHora(avisos.silencioAte)}`
                : ', sem silêncio noturno'
            }`}
            onPress={() => router.push('/notificacoes')}
            ultima
          />
        </Grupo>

        <Secao
          titulo="Privacidade e dados"
          nota="Os direitos abaixo são os da LGPD (Lei 13.709/2018). Nenhum deles custa nada e nenhum exige justificativa."
        />
        <Grupo>
          <Linha
            icone="download"
            titulo="Baixar meus dados"
            corpo="Tudo o que guardamos, num arquivo legível — art. 18, II e V"
            onPress={() => router.push('/config/privacidade')}
          />
          <Linha
            icone="check"
            titulo="Consentimentos"
            corpo="O que você autorizou, e como desfazer — art. 8º, §5º"
            onPress={() => router.push('/config/privacidade')}
          />
          <Linha
            icone="question"
            titulo="Revisar uma decisão automática"
            corpo="Discordar de um veredito de cupom ou de uma recomendação — art. 20"
            onPress={() => router.push('/config/privacidade')}
          />
          <Linha
            icone="trash"
            titulo="Apagar minha conta e meus dados"
            corpo="Eliminação definitiva — art. 18, VI"
            perigo
            onPress={() => router.push('/config/apagar')}
            ultima
          />
        </Grupo>

        <Secao titulo="Documentos" />
        <Grupo>
          <Linha
            icone="doc"
            titulo="Política de privacidade"
            corpo="Que dados coletamos, para quê, por quanto tempo"
            onPress={() => router.push('/config/privacidade')}
          />
          <Linha
            icone="doc"
            titulo="Termos de uso"
            corpo="Inclui a regra de comissão por link de loja"
            onPress={() => router.push('/config/termos')}
          />
          <Linha
            icone="user"
            titulo="Encarregado de dados"
            corpo="Quem responde pelas suas solicitações — art. 41"
            onPress={() => router.push('/config/privacidade')}
            ultima
          />
        </Grupo>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          onPress={() => router.push('/entrada')}
          style={({ pressed }) => [s.sair, pressed && { backgroundColor: c.wash }]}>
          <Text style={s.sairTxt}>Sair da conta</Text>
        </Pressable>

        <Txt variant="meta" style={s.versao}>
          Aptum {VERSAO}
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function Secao({ titulo, nota }: { titulo: string; nota?: string }) {
  const s = useS();
  return (
    <View style={s.secao}>
      <Text style={s.secaoTitulo}>{titulo}</Text>
      {nota ? (
        <Txt variant="body" style={{ marginTop: space.s2 }}>
          {nota}
        </Txt>
      ) : null}
    </View>
  );
}

function Grupo({ children }: { children: React.ReactNode }) {
  const s = useS();
  return <View style={s.grupo}>{children}</View>;
}

function Linha({
  icone,
  titulo,
  corpo,
  valor,
  perigo,
  ultima,
  onPress,
}: {
  icone: IconName;
  titulo: string;
  corpo?: string;
  valor?: string;
  perigo?: boolean;
  ultima?: boolean;
  onPress: () => void;
}) {
  const s = useS();
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={corpo ? `${titulo}. ${corpo}` : titulo}
      onPress={onPress}
      style={({ pressed }) => [s.linha, !ultima && s.linhaDiv, pressed && { opacity: 0.75 }]}>
      <Icon name={icone} size={19} color={perigo ? c.up : c.ink3} strokeWidth={1.9} />
      <View style={{ flex: 1 }}>
        <Text style={[s.linhaTitulo, perigo && { color: c.up }]}>{titulo}</Text>
        {corpo ? (
          <Txt variant="body" style={{ marginTop: 1 }}>
            {corpo}
          </Txt>
        ) : null}
      </View>
      {valor ? <Text style={s.valor}>{valor}</Text> : null}
      <Icon name="chevron" size={18} color={c.ink3} strokeWidth={2} />
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s8 },

  secao: { paddingHorizontal: space.s4, paddingTop: space.s6, paddingBottom: space.s2 },
  secaoTitulo: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },

  grupo: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    marginHorizontal: space.s4,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    padding: space.s4,
    minHeight: 64,
  },
  linhaDiv: { borderBottomWidth: 1, borderBottomColor: c.line },
  linhaTitulo: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  valor: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink3 },

  temaBox: { padding: space.s4 },
  temaTitulo: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  segment: {
    flexDirection: 'row',
    gap: space.s1,
    backgroundColor: c.wash,
    borderRadius: radius.r2,
    padding: 3,
    marginTop: space.s3,
  },
  segItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.r1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s2,
  },
  segItemOn: { backgroundColor: c.plum },
  segTxt: { fontFamily: font.uiBold, fontSize: size.t1, color: c.ink2 },
  segTxtOn: { color: c.onPlum },

  sair: {
    minHeight: TAP + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.s6,
    marginHorizontal: space.s4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: c.line2,
  },
  sairTxt: { fontFamily: font.uiExtra, fontSize: size.t3, color: c.ink2 },

  versao: { textAlign: 'center', marginTop: space.s4 },
}));
