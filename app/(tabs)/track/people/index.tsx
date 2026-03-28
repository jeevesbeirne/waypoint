import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../../store';
import { getPeople, type Person } from '../../../../db/peopleRepo';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';

const CATEGORY_COLORS: Record<string, string> = {
  'Boss / Line Manager': '#E11D48',
  'Direct Report': '#7C3AED',
  'Team Member': '#2563EB',
  Peer: '#059669',
  'Senior Stakeholder': '#D97706',
  'Client / Customer': '#0891B2',
  'External Partner': '#6B7280',
  'Wider Stakeholder': '#8B5CF6',
  Other: '#9CA3AF',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function TrackPeopleList() {
  const router = useRouter();
  const { people, setPeople } = useAppStore();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const loadPeople = useCallback(async () => {
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (e) {
      console.error('Load people error:', e);
    }
  }, [setPeople]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Track</Text>
          </Pressable>
          <Text style={styles.heading}>People</Text>
          <Pressable style={styles.addBtn} onPress={() => router.push('/(tabs)/track/people/add' as any)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search people..."
          placeholderTextColor={colors.text.muted}
        />

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👤</Text>
            <Text style={styles.emptyTitle}>No people yet</Text>
            <Text style={styles.emptyDesc}>
              Add the key people in your transition — your boss, direct reports, stakeholders.
            </Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/(tabs)/track/people/add' as any)}>
              <Text style={styles.emptyBtnText}>+ Add your first person</Text>
            </Pressable>
          </View>
        ) : (
          CATEGORIES.filter((cat) => filtered.some((p) => (p.category ?? 'Other') === cat)).map((cat) => {
            const catPeople = filtered.filter((p) => (p.category ?? 'Other') === cat);
            const isExpanded = expandedCategories.has(cat);
            const catColor = CATEGORY_COLORS[cat] ?? '#9CA3AF';
            return (
              <View key={cat}>
                <Pressable
                  style={styles.categoryHeader}
                  onPress={() => {
                    setExpandedCategories((prev) => {
                      const next = new Set(prev);
                      if (next.has(cat)) next.delete(cat);
                      else next.add(cat);
                      return next;
                    });
                  }}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
                    <Text style={styles.categoryHeaderText}>{cat}</Text>
                    <Text style={styles.categoryCount}>{catPeople.length}</Text>
                  </View>
                  <Text style={styles.categoryChevron}>{isExpanded ? '▼' : '▶'}</Text>
                </Pressable>
                {isExpanded && catPeople.map((person) => (
                  <Pressable
                    key={person.id}
                    style={styles.personCard}
                    onPress={() => router.push(`/(tabs)/track/people/${person.id}` as any)}
                  >
                    <View style={styles.personAvatar}>
                      <Text style={styles.personAvatarText}>{person.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{person.name}</Text>
                      {person.title ? <Text style={styles.personTitle}>{person.title}</Text> : null}
                      {person.organisation ? <Text style={styles.personOrg}>{person.organisation}</Text> : null}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            );
          })
        )}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary },
  addBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  addBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold },
  searchInput: {
    marginHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.text.primary,
  },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary, marginBottom: spacing.sm },
  emptyDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full },
  emptyBtnText: { color: '#fff', fontWeight: typography.weights.semibold },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: '#F3F4F6', borderRadius: radii.md, marginBottom: spacing.sm, marginTop: spacing.xs,
  },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryHeaderText: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text.primary },
  categoryCount: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.full, overflow: 'hidden' },
  categoryChevron: { color: colors.text.muted, fontSize: typography.sizes.sm },
  personCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm,
  },
  personAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  personAvatarText: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: typography.weights.bold },
  personInfo: { flex: 1 },
  personName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.primary },
  personTitle: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: 2 },
  personOrg: { fontSize: typography.sizes.xs, color: colors.text.muted },
  chevron: { fontSize: 22, color: colors.text.muted },
});
