import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { colors } from '../../lib/theme';
import QuickCaptureFAB from '../../components/QuickCaptureFAB';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.primary,
            borderTopColor: 'rgba(255,255,255,0.08)',
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: 'rgba(248,246,241,0.45)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="learn"
          options={{
            title: Platform.OS === 'web' ? '📚 Learn' : 'Learn',
            tabBarIcon: Platform.OS === 'web' ? () => null : ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
            ...(Platform.OS === 'web' ? { tabBarShowIcon: false } : {}),
          }}
        />
        <Tabs.Screen
          name="checklist"
          options={{
            title: Platform.OS === 'web' ? '✅ Checklist' : 'Checklist',
            tabBarIcon: Platform.OS === 'web' ? () => null : ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
            ...(Platform.OS === 'web' ? { tabBarShowIcon: false } : {}),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: Platform.OS === 'web' ? '📊 Track' : 'Track',
            tabBarIcon: Platform.OS === 'web' ? () => null : ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
            ...(Platform.OS === 'web' ? { tabBarShowIcon: false } : {}),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: Platform.OS === 'web' ? '⚙️ Settings' : 'Settings',
            tabBarIcon: Platform.OS === 'web' ? () => null : ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
            ...(Platform.OS === 'web' ? { tabBarShowIcon: false } : {}),
          }}
        />

        {/* Hidden routes — still accessible but not in tab bar */}
        <Tabs.Screen name="record-reflect" options={{ href: null }} />
        <Tabs.Screen name="meetings" options={{ href: null }} />
        <Tabs.Screen name="people" options={{ href: null }} />
        <Tabs.Screen name="reflect" options={{ href: null }} />
        <Tabs.Screen name="calendar" options={{ href: null }} />
      </Tabs>
      <QuickCaptureFAB />
    </View>
  );
}
