import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ChecklistItem } from '../db/checklistRepo';
import { colors, radii, spacing, typography } from '../lib/theme';
import { WATKINS_GROUPS, WATKINS_SUB_ACTIVITIES } from '../lib/watkinsGroups';
import { getWeekDateRange } from '../lib/utils';

interface ItemDetailModalProps {
  item: ChecklistItem | null;
  visible: boolean;
  onClose: () => void;
  onToggle: (id: string, completed: boolean) => void | Promise<void>;
  onSave: (id: string, updates: Record<string, unknown>) => void | Promise<void>;
  allItems: ChecklistItem[];
  startDate?: string | null;
}

const WEEK_OPTIONS = Array.from({ length: 14 }, (_, i) => i);

function parseGroups(raw: string | null | undefined): string[] {
  if (raw == null || raw === '') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export default function ItemDetailModal({
  item,
  visible,
  onClose,
  onToggle,
  onSave,
  allItems,
  startDate,
}: ItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [subActivity, setSubActivity] = useState('');
  const [startWeek, setStartWeek] = useState(0);
  const [endWeek, setEndWeek] = useState(0);

  useEffect(() => {
    if (item == null) return;
    const parsedGroups = parseGroups(item.watkins_groups);
    const normalizedStart = item.start_week ?? item.scheduled_week ?? item.default_week;
    const normalizedEnd = item.end_week ?? normalizedStart;
    setTitle(item.title);
    setDescription(item.description ?? '');
    setSelectedGroups(parsedGroups.slice(0, 2));
    setSubActivity(item.sub_activity ?? '');
    setStartWeek(normalizedStart);
    setEndWeek(normalizedEnd);
    setIsEditing(false);
  }, [item, visible]);

  const parentTitle = useMemo(() => {
    if (item == null || item.parent_id == null) return null;
    return allItems.find((candidate) => candidate.id === item.parent_id)?.title ?? null;
  }, [allItems, item]);

  if (item == null) return null;

  const complete = item.completed === 1;
  const duration = Math.max(0, endWeek - startWeek);
  const weekText = startWeek === endWeek ? `Week ${startWeek}` : `Week ${startWeek}-${endWeek}`;
  const dateText = startDate
    ? `${getWeekDateRange(startDate, Math.max(1, startWeek || 1))} -> ${getWeekDateRange(startDate, Math.max(1, endWeek || 1))}`
    : null;

  const activityOptions = selectedGroups.length > 0
    ? WATKINS_SUB_ACTIVITIES[selectedGroups[0] as keyof typeof WATKINS_SUB_ACTIVITIES] ?? []
    : [];

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) => {
      if (prev.includes(group)) return prev.filter((g) => g !== group);
      if (prev.length >= 2) return prev;
      return [...prev, group];
    });
  };

  const onStartWeekChange = (week: number) => {
    const currentDuration = duration;
    setStartWeek(week);
    setEndWeek(Math.min(13, week + currentDuration));
  };

  const handleSave = async () => {
    await onSave(item.id, {
      title: title.trim(),
      description: description.trim(),
      start_week: startWeek,
      end_week: endWeek,
      scheduled_week: startWeek,
      watkins_groups: JSON.stringify(selectedGroups),
      sub_activity: subActivity || null,
    });
    setIsEditing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable>
          <Pressable onPress={() => setIsEditing((v) => !v)}><Text style={styles.edit}>Edit ✏️</Text></Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {isEditing ? (
            <>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Watkins Groups (max 2)</Text>
              <View style={styles.rowWrap}>
                {WATKINS_GROUPS.map((group) => {
                  const selected = selectedGroups.includes(group);
                  return (
                    <Pressable key={group} style={[styles.chip, selected && styles.chipOn]} onPress={() => toggleGroup(group)}>
                      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{group}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Sub-Activity</Text>
              <View style={styles.rowWrap}>
                {activityOptions.length === 0 && <Text style={styles.muted}>Select a Watkins group first.</Text>}
                {activityOptions.map((activity) => {
                  const active = subActivity === activity;
                  return (
                    <Pressable key={activity} style={[styles.chip, active && styles.chipOn]} onPress={() => setSubActivity(activity)}>
                      <Text style={[styles.chipText, active && styles.chipTextOn]}>{activity}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>Start Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rowWrap}>
                  {WEEK_OPTIONS.map((w) => {
                    const active = startWeek === w;
                    return (
                      <Pressable key={`sw-${w}`} style={[styles.chip, active && styles.chipOn]} onPress={() => onStartWeekChange(w)}>
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>Wk {w}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.label}>End Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rowWrap}>
                  {WEEK_OPTIONS.filter((w) => w >= startWeek).map((w) => {
                    const active = endWeek === w;
                    return (
                      <Pressable key={`ew-${w}`} style={[styles.chip, active && styles.chipOn]} onPress={() => setEndWeek(w)}>
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>Wk {w}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={styles.meta}>Starts: Week {startWeek}{' -> '}Ends: Week {endWeek}</Text>
              {dateText ? <Text style={styles.meta}>Dates: {dateText}</Text> : null}

              <View style={styles.actions}>
                <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.meta}>{weekText}</Text>
              <Text style={styles.meta}>Starts: Week {startWeek}{' -> '}Ends: Week {endWeek}</Text>
              {dateText ? <Text style={styles.meta}>Dates: {dateText}</Text> : null}
              {parentTitle ? <Text style={styles.meta}>Parent: {parentTitle}</Text> : null}
              {selectedGroups.length > 0 ? (
                <Text style={styles.meta}>Groups: {selectedGroups.join(', ')}</Text>
              ) : null}
              {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.toggleBtn, complete && styles.toggleBtnComplete]}
            onPress={() => onToggle(item.id, complete ? false : true)}
          >
            <Text style={[styles.toggleText, complete && styles.toggleTextComplete]}>
              {complete ? '✓ Completed' : 'Mark complete'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  close: { color: colors.text.secondary, fontSize: typography.sizes.base },
  edit: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: '600' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  description: { fontSize: typography.sizes.base, color: colors.text.secondary, marginBottom: spacing.sm },
  detail: { marginTop: spacing.md, fontSize: typography.sizes.base, color: colors.text.primary, lineHeight: 21 },
  label: { marginTop: spacing.sm, marginBottom: spacing.xs, color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
  },
  textArea: { minHeight: 92, textAlignVertical: 'top' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text.secondary, fontSize: typography.sizes.xs },
  chipTextOn: { color: colors.text.inverse, fontWeight: '600' },
  muted: { color: colors.text.muted, fontSize: typography.sizes.sm },
  meta: { color: colors.text.secondary, fontSize: typography.sizes.sm, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  actionBtn: { flex: 1, borderRadius: radii.md, paddingVertical: spacing.sm, alignItems: 'center' },
  cancelBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary },
  cancelBtnText: { color: colors.text.secondary, fontWeight: '600' },
  saveBtnText: { color: colors.text.inverse, fontWeight: '700' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  toggleBtn: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnComplete: { borderColor: colors.success, backgroundColor: '#EAF8EE' },
  toggleText: { color: colors.text.primary, fontWeight: '700' },
  toggleTextComplete: { color: colors.success },
});
