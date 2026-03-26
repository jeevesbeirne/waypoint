import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import { colors, typography, spacing, radii } from '../../../lib/theme';
import ReflectContent from '../../../components/ReflectContent';
import PeopleContent from '../../../components/PeopleContent';

const SUB_TABS = ['Reflect', 'People'] as const;
type SubTab = typeof SUB_TABS[number];

export default function RecordReflectScreen() {
  const [activeTab, setActiveTab] = useState<SubTab>('Reflect');

  return (
    <View style={styles.container}>
      {/* Sub-tab bar */}
      <View style={styles.tabBar}>
        {SUB_TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'Reflect' ? '💭 Reflect' : '👤 People'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'Reflect' ? <ReflectContent /> : <PeopleContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },
  tabTextActive: {
    color: '#fff',
  },
});
