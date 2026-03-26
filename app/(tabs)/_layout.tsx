import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
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
            title: 'Learn',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="checklist"
          options={{
            title: 'Checklist',
            tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="record-reflect"
          options={{
            title: 'Record',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📓" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="meetings"
          options={{
            title: 'Meetings',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          }}
        />

        {/* Keep people and reflect routes but hide from tab bar */}
        <Tabs.Screen
          name="people"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="reflect"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="calendar"
          options={{ href: null }}
        />

        {/* Suppress sub-screens from the tab bar */}
        <Tabs.Screen name="learn/article/[id]" options={{ tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="meetings/[id]" options={{ tabBarItemStyle: { display: 'none' } }} />
      </Tabs>
      <QuickCaptureFAB />
    </View>
  );
}
