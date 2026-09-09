import {
  Archivo_400Regular,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';
import { Jost_400Regular } from '@expo-google-fonts/jost';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { makeStyles, useIsDark, useTheme } from '@/design/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const c = useTheme();
  const s = useS();
  const escuro = useIsDark();
  const [ready] = useFonts({
    Archivo_400Regular,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Jost_400Regular,
  });

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={s.frame}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.paper },
          animation: 'slide_from_right',
        }}>
        {/* precisa vir primeiro: o expo-router adota a primeira tela como inicial */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lista/nova" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="compra/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="alerta/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="entrada" options={{ animation: 'fade' }} />
        <Stack.Screen name="bloqueada" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}

/**
 * No navegador o app é um protótipo de celular: prender a largura
 * evita que o cartão de produto estique e vire outra coisa.
 */
const useS = makeStyles((c) => ({
  frame: {
    flex: 1,
    backgroundColor: c.plum,
    ...Platform.select({
      web: { maxWidth: 430, width: '100%', alignSelf: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: c.plum3 },
      default: {},
    }),
  },
}));
