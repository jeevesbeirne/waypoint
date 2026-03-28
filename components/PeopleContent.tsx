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
import { useAppStore } from '../store';
import { getPeople, type Person } from '../db/peopleRepo';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';

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

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? '#9CA3AF';
  return (
    <View style={[styles.categoryBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.categoryBadgeText, { color }]}>{category}</Text>
    </View>
  );
}

export default function PeopleContent() {
  const router = useRouter();
  const { people, setPeople } = useAppStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('category');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES));

  const loadPeople = useCallback(async () => {
    try {
      const data = await getPeople();
      setPeople(data);
    } catch (e) {
      console.error('Load people error:', e);
    }
  }, []);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (a.category ?? '').localeCompare(b.category ?? '');
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>People</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/people/add-person')}
        >
          <Text style={styles.addBtnText}>+ Add Person</Text>
        </Pressable>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search people..."
        placeholderTextColor={colors.text.muted}
      />

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['name', 'category'] as const).map((s) => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
            onPress={() => setSortBy(s)}
          >
            <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
              {s === 'name' ? 'Name' : 'Category'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* People list */}
      {sorted.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👤</Text>
          <Text style={styles.emptyTitle}>No people yet</Text>
          <Text style={styles.emptyDesc}>
            Add the key people in your transition — your boss, direct reports, stakeholders.
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => router.push('/(tabs)/people/add-person')}
          >
            <Text style={styles.emptyBtnText}>+ Add your first person</Text>
          </Pressable>
        </View>
      ) : sortBy === 'category' ? (
        CATEGORIES.filter((cat) => sorted.some((p) => (p.category ?? 'Other') === cat)).map((cat) => {
          const catPeople = sorted.filter((p) => (p.category ?? 'Other') === cat);
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
                  onPress={() => router.push(`/(tabs)/people/${person.id}`)}
                >
                  <View style={styles.personAvatar}>
                    <Text style={styles.personAvatarText}>
                      {person.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    {person.title ? <Text style={styles.personTitle}>{person.title}</Text> : null}
                    {person.organisation && (
                      <Text style={styles.personOrg}>{person.organisation}</Text>
                    )}
                  </View>
                  <View style={styles.personActions}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })
      ) : (
        sorted.map((person) => (
          <Pressable
            key={person.id}
            style={styles.personCard}
            onPress={() => router.push(`/(tabs)/people/${person.id}`)}
          >
            <View style={styles.personAvatar}>
              <Text style={styles.personAvatarText}>
                {person.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{person.name}</Text>
              {person.title ? <Text style={styles.personTitle}>{person.title}</Text> : null}
              {person.organisation && (
                <Text style={styles.personOrg}>{person.organisation}</Text>
              )}
              <CategoryBadge category={person.category ?? 'Other'} />
            </View>
            <View style={styles.personActions}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        ))
      )}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  addBtnText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },

  searchInput: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sortLabel: { fontSize: typography.sizes.xs, color: colors.text.muted },
  sortBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
  },
  sortBtnActive: { backgroundColor: colors.primary },
  sortBtnText: { fontSize: typography.sizes.xs, color: colors.text.muted },
  sortBtnTextActive: { color: '#fff', fontWeight: '600' },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: typography.weights.semibold },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryHeaderText: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text.primary },
  categoryCount: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radii.full, overflow: 'hidden' },
  categoryChevron: { color: colors.text.muted, fontSize: typography.sizes.sm },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  personAvatarText: {
    color: colors.accent,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  personInfo: { flex: 1 },
  personName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  personTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  personOrg: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: 2,
  },
  categoryBadgeText: { fontSize: typography.sizes.xs, fontWeight: '600' },
  personActions: { marginLeft: spacing.sm },
  chevron: { fontSize: 22, color: colors.text.muted },
});
