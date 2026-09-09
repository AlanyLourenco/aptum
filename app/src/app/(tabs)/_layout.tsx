import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { useTheme } from '@/design/theme';

export default function TabsLayout() {
  const c = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.paper },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="cupons" options={{ title: 'Cupons' }} />
      <Tabs.Screen name="listas" options={{ title: 'Listas' }} />
      <Tabs.Screen name="levar" options={{ title: 'Vou levar' }} />
      <Tabs.Screen name="conta" options={{ title: 'Conta' }} />
    </Tabs>
  );
}
