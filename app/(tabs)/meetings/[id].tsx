import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getMeetingById,
  deleteMeeting,
  addMeetingAction,
  markActionAddedToChecklist,
  toggleMeetingAction,
  type MeetingWithPeople,
  type MeetingAction,
} from '../../../db/meetingsRepo';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';
import { formatDate } from '../../../lib/utils';
import AddToChecklistModal from '../../../components/AddToChecklistModal';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingWithPeople | null>(null);
  const [loading, setLoading] = useState(true);

  // Add action modal
  const [showAddAction, setShowAddAction] = useState(false);
  const [actionText, setActionText] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Add to checklist modal (shared component)
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistInitialTitle, setChecklistInitialTitle] = useState('');
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadMeeting = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getMeetingById(id);
      setMeeting(data);
    } catch (e) {
      console.error('Load meeting error:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const handleDelete = () => {
    Alert.alert('Delete meeting', 'Are you sure you want to delete this meeting?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMeeting(id);
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Could not delete meeting.');
          }
        },
      },
    ]);
  };

  const handleAddAction = async () => {
    if (!actionText.trim()) return;
    setSavingAction(true);
    try {
      await addMeetingAction(id, actionText.trim());
      await loadMeeting();
      setActionText('');
      setShowAddAction(false);
    } catch (e) {
      Alert.alert('Error', 'Could not save action item.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleAddToChecklist = (action: MeetingAction) => {
    setChecklistInitialTitle(action.text);
    setPendingActionId(action.id);
    setShowChecklistModal(true);
  };

  const handleChecklistSaved = async (checklistItemId: string) => {
    if (pendingActionId) {
      await markActionAddedToChecklist(pendingActionId, checklistItemId);
    }
    setPendingActionId(null);
    await loadMeeting();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Meeting not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const actions = meeting.actions ?? [];
  const meetingPeople = meeting.people ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>

        {/* Meeting info */}
        <View style={styles.meetingCard}>
          <Text style={styles.meetingTitle}>{meeting.title || 'Untitled meeting'}</Text>
          <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
          {meeting.meeting_type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{meeting.meeting_type}</Text>
            </View>
          ) : null}
        </View>

        {/* People present */}
        {meetingPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>People present</Text>
            <View style={styles.peopleRow}>
              {meetingPeople.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.personChip}
                  onPress={() => router.push(`/(tabs)/people/${p.id}`)}
                >
                  <Text style={styles.personChipText}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {meeting.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{meeting.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Action items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Action Items ({actions.length})</Text>
            <Pressable style={styles.addActionBtn} onPress={() => setShowAddAction(true)}>
              <Text style={styles.addActionBtnText}>+ Add action</Text>
            </Pressable>
          </View>

          {actions.length === 0 ? (
            <View style={styles.emptyActions}>
              <Text style={styles.emptyActionsText}>No action items yet</Text>
              <Pressable onPress={() => setShowAddAction(true)}>
                <Text style={styles.emptyActionsLink}>+ Add an action item →</Text>
              </Pressable>
            </View>
          ) : (
            actions.map((action) => (
              <View key={action.id} style={styles.actionRow}>
                <Pressable
                  style={styles.actionCheckbox}
                  onPress={async () => {
                    await toggleMeetingAction(action.id, action.completed !== 1);
                    await loadMeeting();
                  }}
                >
                  <Text style={styles.actionCheckboxText}>
                    {action.completed === 1 ? '✅' : '⬜'}
                  </Text>
                </Pressable>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionText, action.completed === 1 && styles.actionTextDone]}>
                    {action.text}
                  </Text>
                  {action.added_to_checklist === 1 ? (
                    <View style={styles.checklistBadge}>
                      <Text style={styles.checklistBadgeText}>✅ In checklist</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addToChecklistBtn}
                      onPress={() => handleAddToChecklist(action)}
                    >
                      <Text style={styles.addToChecklistBtnText}>→ Checklist</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Add action modal */}
      <Modal visible={showAddAction} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Add Action Item</Text>
            <TextInput
              style={[styles.inputField, styles.notesInput]}
              value={actionText}
              onChangeText={setActionText}
              placeholder="What needs to happen?"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => { setShowAddAction(false); setActionText(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveBtn, savingAction && { opacity: 0.6 }]}
                onPress={handleAddAction}
                disabled={savingAction}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add to checklist modal */}
      {/* Add to checklist modal — shared component */}
      <AddToChecklistModal
        visible={showChecklistModal}
        onClose={() => { setShowChecklistModal(false); setPendingActionId(null); }}
        onSaved={handleChecklistSaved}
        initialTitle={checklistInitialTitle}
        sourceMeetingId={id}
        sourceLabel={meeting?.title || 'this meeting'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.text.muted },
  notFoundText: { color: colors.text.secondary, marginBottom: spacing.md },
  backLink: { color: colors.accent },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  deleteText: { color: colors.error, fontSize: typography.sizes.sm },

  meetingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  meetingTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  meetingDate: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.sm },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  typeBadgeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },

  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  addActionBtn: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  addActionBtnText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },

  peopleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  personChipText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },

  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.6,
  },

  emptyActions: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyActionsText: { color: colors.text.muted, marginBottom: spacing.sm },
  emptyActionsLink: { color: colors.accent, fontWeight: '600' },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionCheckbox: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  actionCheckboxText: { fontSize: 18 },
  actionContent: { flex: 1 },
  actionTextDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  actionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  checklistBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  checklistBadgeText: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: '600' },
  addToChecklistBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  addToChecklistBtnText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },

  // Modals
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalInner: { padding: spacing.lg },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  inputField: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  notesInput: { minHeight: 80, paddingTop: spacing.sm },
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
  weekScroll: { marginBottom: spacing.sm },
  meetingSourceNote: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: { color: colors.text.secondary, fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontWeight: typography.weights.bold },
});
