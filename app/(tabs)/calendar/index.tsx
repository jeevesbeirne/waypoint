import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import type { ChecklistItem } from '../../../db/checklistRepo';
import { getChecklistItems, toggleChecklistItem, updateChecklistItemFields } from '../../../db/checklistRepo';
import { colors, radii, spacing, typography, shadows } from '../../../lib/theme';
import { getWeekDateRange } from '../../../lib/utils';
import ItemDetailModal from '../../../components/ItemDetailModal';
import { WATKINS_GROUP_COLORS, WATKINS_GROUPS } from '../../../lib/watkinsGroups';

const TOTAL_WEEKS = 14;
const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i);

function parseGroups(item: ChecklistItem): string[] {
  if (!item.watkins_groups) return [];
  try {
    const parsed = JSON.parse(item.watkins_groups);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function getPrimaryGroup(item: ChecklistItem): string {
  const groups = parseGroups(item);
  if (groups[0]) return groups[0];
  if (item.category === 'Boss') return 'Negotiate Success';
  if (item.category === 'Team') return 'Build Your Team';
  if (item.category === 'Stakeholders') return 'Create Alliances';
  if (item.category === 'Strategy') return 'Match Strategy to Situation';
  if (item.default_week === 0) return 'Prepare Yourself';
  return 'Manage Yourself';
}

function getStartWeek(item: ChecklistItem): number {
  return item.start_week ?? item.scheduled_week ?? item.default_week;
}

function getEndWeek(item: ChecklistItem): number {
  return item.end_week ?? getStartWeek(item);
}

function isInWeek(item: ChecklistItem, week: number): boolean {
  return week >= getStartWeek(item) && week <= getEndWeek(item);
}

function getPhaseLabel(week: number): { label: string; color: string } {
  if (week === 0) return { label: 'Before Start', color: '#6366F1' };
  if (week <= 4) return { label: 'Learn', color: '#3B82F6' };
  if (week <= 8) return { label: 'Build', color: '#F59E0B' };
  return { label: 'Deliver', color: '#10B981' };
}

export default function CalendarTab() {
  const { checklistItems, setChecklistItems, settings } = useAppStore();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadItems = useCallback(async () => {
    const items = await getChecklistItems();
    setChecklistItems(items);
  }, [setChecklistItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const currentWeek = useMemo(() => {
    if (!settings?.start_date) return 1;
    const start = new Date(settings.start_date);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (diff < 0) return 0;
    return Math.min(13, diff + 1);
  }, [settings?.start_date]);

  // Build week summaries
  const weekData = useMemo(() => {
    return WEEKS.map((week) => {
      const items = checklistItems.filter((item) => isInWeek(item, week));
      const doneCount = items.filter((i) => i.completed === 1).length;
      const totalCount = items.length;

      // Count per Watkins group
      const groupCounts = new Map<string, { total: number; done: number }>();
      for (const item of items) {
        const groups = parseGroups(item);
        const targets = groups.length > 0 ? groups : [getPrimaryGroup(item)];
        for (const g of targets) {
          if (!groupCounts.has(g)) groupCounts.set(g, { total: 0, done: 0 });
          const c = groupCounts.get(g)!;
          c.total++;
          if (item.completed === 1) c.done++;
        }
      }

      return { week, items, doneCount, totalCount, groupCounts };
    });
  }, [checklistItems]);

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const hasStartDate = Boolean(settings?.start_date);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <View style={styles.phaseRow}>
          <View style={[styles.phaseDot, { backgroundColor: '#6366F1' }]} />
          <Text style={styles.phaseLabel}>Pre</Text>
          <View style={[styles.phaseDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.phaseLabel}>Learn</Text>
          <View style={[styles.phaseDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.phaseLabel}>Build</Text>
          <View style={[styles.phaseDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.phaseLabel}>Deliver</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {weekData.map(({ week, items, doneCount, totalCount, groupCounts }) => {
          if (totalCount === 0) return null;
          const phase = getPhaseLabel(week);
          const isCurrentWeek = week === currentWeek;
          const isExpanded = expandedWeeks.has(week);
          const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
          const dateRange = hasStartDate && settings?.start_date && week > 0
            ? getWeekDateRange(settings.start_date, week)
            : null;

          return (
            <View key={`week-${week}`}>
              <Pressable
                style={[
                  styles.weekCard,
                  isCurrentWeek && styles.weekCardCurrent,
                ]}
                onPress={() => toggleWeek(week)}
              >
                <View style={styles.weekCardHeader}>
                  <View style={styles.weekCardLeft}>
                    <View style={[styles.weekNumberBadge, { backgroundColor: phase.color }]}>
                      <Text style={styles.weekNumberText}>{week === 0 ? 'Pre' : `W${week}`}</Text>
                    </View>
                    <View>
                      <Text style={styles.weekTitle}>
                        {week === 0 ? 'Before You Start' : `Week ${week}`}
                        {isCurrentWeek ? '  ← You are here' : ''}
                      </Text>
                      {dateRange && <Text style={styles.weekDates}>{dateRange}</Text>}
                      <Text style={styles.weekPhase}>{phase.label} phase</Text>
                    </View>
                  </View>
                  <View style={styles.weekCardRight}>
                    <Text style={styles.weekProgress}>{doneCount}/{totalCount}</Text>
                    <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.weekProgressBar}>
                  <View style={[styles.weekProgressFill, { width: `${progressPct}%` as `${number}%`, backgroundColor: phase.color }]} />
                </View>

                {/* Watkins group dots */}
                <View style={styles.groupDotsRow}>
                  {WATKINS_GROUPS.filter((g) => groupCounts.has(g)).map((g) => {
                    const gc = groupCounts.get(g)!;
                    const gColor = (WATKINS_GROUP_COLORS as Record<string, string>)[g] ?? colors.accent;
                    return (
                      <View key={g} style={styles.groupDotWrap}>
                        <View style={[styles.groupDot, { backgroundColor: gColor, opacity: gc.done === gc.total ? 0.4 : 1 }]} />
                        <Text style={styles.groupDotLabel} numberOfLines={1}>{g.split(' ')[0]}</Text>
                        <Text style={styles.groupDotCount}>{gc.done}/{gc.total}</Text>
                      </View>
                    );
                  })}
                </View>
              </Pressable>

              {/* Expanded task list */}
              {isExpanded && items
                .sort((a, b) => (a.completed === 1 ? 1 : 0) - (b.completed === 1 ? 1 : 0))
                .map((item) => {
                  const gColor = (WATKINS_GROUP_COLORS as Record<string, string>)[getPrimaryGroup(item)] ?? colors.accent;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.taskRow, { borderLeftColor: gColor }]}
                      onPress={() => { setSelectedItem(item); setShowDetail(true); }}
                    >
                      <Pressable
                        style={styles.taskCheckbox}
                        onPress={() => void toggleChecklistItem(item.id, item.completed !== 1).then(loadItems)}
                      >
                        <Text style={styles.taskCheckText}>{item.completed === 1 ? '✅' : '⬜'}</Text>
                      </Pressable>
                      <View style={styles.taskContent}>
                        <Text
                          numberOfLines={2}
                          style={[styles.taskTitle, item.completed === 1 && styles.taskTitleDone]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.taskGroup}>{getPrimaryGroup(item)}</Text>
                      </View>
                    </Pressable>
                  );
                })}
            </View>
          );
        })}
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      <ItemDetailModal
        item={selectedItem}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        allItems={checklistItems}
        startDate={settings?.start_date ?? null}
        onToggle={async (id, done) => {
          await toggleChecklistItem(id, done);
          await loadItems();
        }}
        onSave={async (id, updates) => {
          await updateChecklistItemFields(id, updates);
          await loadItems();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.text.primary, marginBottom: spacing.xs },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  phaseDot: { width: 10, height: 10, borderRadius: 5 },
  phaseLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, marginRight: spacing.sm },
  scroll: { paddingBottom: spacing['2xl'] },
  weekCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  weekCardCurrent: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#F0F7FF',
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  weekCardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: spacing.sm },
  weekNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberText: { color: '#fff', fontWeight: '700', fontSize: typography.sizes.xs },
  weekTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text.primary },
  weekDates: { fontSize: typography.sizes.xs, color: colors.text.secondary, marginTop: 1 },
  weekPhase: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: 1 },
  weekCardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekProgress: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.text.secondary },
  chevron: { color: colors.text.muted, fontSize: typography.sizes.sm },
  weekProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: radii.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  weekProgressFill: { height: 4, borderRadius: radii.full },
  groupDotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  groupDotWrap: { alignItems: 'center', minWidth: 40 },
  groupDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  groupDotLabel: { fontSize: 9, color: colors.text.muted },
  groupDotCount: { fontSize: 9, color: colors.text.secondary, fontWeight: '600' },
  taskRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    paddingVertical: spacing.sm,
  },
  taskCheckbox: { width: 40, alignItems: 'center', justifyContent: 'center' },
  taskCheckText: { fontSize: 18 },
  taskContent: { flex: 1, paddingRight: spacing.sm },
  taskTitle: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text.primary },
  taskTitleDone: { color: colors.text.muted, textDecorationLine: 'line-through' },
  taskGroup: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: 2 },
});
