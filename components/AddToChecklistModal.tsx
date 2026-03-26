import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addCustomChecklistItem } from '../db/checklistRepo';
import { colors, typography, spacing, radii } from '../lib/theme';
import { getTodayString } from '../lib/utils';

export interface AddToChecklistModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (itemId: string) => void;
  initialTitle?: string;
  sourceMeetingId?: string;
  sourceLogDate?: string;
  /** Label shown in the modal header to give context */
  sourceLabel?: string;
}

const CATEGORIES = ['Boss', 'Team', 'Stakeholders', 'Self', 'Strategy', 'Operations', 'Other'];
const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);

type Priority = 'high' | 'normal';

export default function AddToChecklistModal({
  visible,
  onClose,
  onSaved,
  initialTitle = '',
  sourceMeetingId,
  sourceLogDate,
  sourceLabel,
}: AddToChecklistModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Self');
  const [week, setWeek] = useState(1);
  const [priority, setPriority] = useState<Priority>('normal');
  const [saving, setSaving] = useState(false);

  // Sync title when initialTitle changes (e.g. different action item tapped)
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    setSaving(true);
    try {
      const today = getTodayString();
      const item = await addCustomChecklistItem({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        week,
        source_meeting_id: sourceMeetingId,
        source_log_date: sourceLogDate ?? (sourceMeetingId ? undefined : today),
      });
      onSaved?.(item.id);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Self');
      setWeek(1);
      setPriority('normal');
      Alert.alert('Added ✓', `"${item.title}" added to ${week === 0 ? 'Before You Start' : `Week ${week}`} checklist.`);
    } catch (e) {
      console.error('AddToChecklistModal save error:', e);
      Alert.alert('Error', 'Could not add to checklist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('Self');
    setWeek(1);
    setPriority('normal');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Add to Checklist</Text>
            <Pressable onPress={handleSave} disabled={saving}>
              <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>

          {/* Source label */}
          {sourceLabel ? (
            <View style={styles.sourceLabel}>
              <Text style={styles.sourceLabelText}>
                {sourceMeetingId ? '🗓️' : '💭'} From: {sourceLabel}
              </Text>
            </View>
          ) : null}

          {/* Title */}
          <Text style={styles.fieldLabel}>Task title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to happen?"
            placeholderTextColor={colors.text.muted}
            autoFocus={!initialTitle}
          />

          {/* Description */}
          <Text style={styles.fieldLabel}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Why does this matter? Any useful context?"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, category === cat && styles.chipSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Week */}
          <Text style={styles.fieldLabel}>Week</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <Pressable
                style={[styles.chip, week === 0 && styles.chipSelected]}
                onPress={() => setWeek(0)}
              >
                <Text style={[styles.chipText, week === 0 && styles.chipTextSelected]}>
                  Before Start
                </Text>
              </Pressable>
              {WEEKS.map((w) => (
                <Pressable
                  key={w}
                  style={[styles.chip, week === w && styles.chipSelected]}
                  onPress={() => setWeek(w)}
                >
                  <Text style={[styles.chipText, week === w && styles.chipTextSelected]}>
                    Wk {w}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Priority */}
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {(['high', 'normal'] as Priority[]).map((p) => (
              <Pressable
                key={p}
                style={[styles.chip, priority === p && styles.chipSelected]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextSelected]}>
                  {p === 'high' ? '⬆️ High' : '▶️ Normal'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Save button */}
          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>Save to Checklist</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cancelText: { color: colors.text.secondary, fontSize: typography.sizes.base },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  saveText: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: '600' },

  sourceLabel: {
    backgroundColor: colors.accentLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  sourceLabelText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },

  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  textArea: { minHeight: 80, paddingTop: spacing.sm },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  chipTextSelected: { color: '#fff', fontWeight: '600' },

  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
