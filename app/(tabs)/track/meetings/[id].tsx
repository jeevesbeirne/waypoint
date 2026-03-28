import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getMeetingById, deleteMeeting, addMeetingAction, markActionAddedToChecklist, toggleMeetingAction,
  type MeetingWithPeople, type MeetingAction,
} from '../../../../db/meetingsRepo';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { formatDate } from '../../../../lib/utils';
import AddToChecklistModal from '../../../../components/AddToChecklistModal';

export default function TrackMeetingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingWithPeople | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddAction, setShowAddAction] = useState(false);
  const [actionText, setActionText] = useState('');
  const [savingAction, setSavingAction] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistInitialTitle, setChecklistInitialTitle] = useState('');
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadMeeting = useCallback(async () => {
    if (!id) return;
    try { setMeeting(await getMeetingById(id)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadMeeting(); }, [loadMeeting]);

  const handleDelete = () => {
    Alert.alert('Delete meeting?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMeeting(id); router.back(); } },
    ]);
  };

  const handleAddAction = async () => {
    if (!actionText.trim()) return;
    setSavingAction(true);
    try { await addMeetingAction(id, actionText.trim()); await loadMeeting(); setActionText(''); setShowAddAction(false); }
    catch (e) { Alert.alert('Error', 'Could not save action.'); }
    finally { setSavingAction(false); }
  };

  const handleAddToChecklist = (action: MeetingAction) => {
    setChecklistInitialTitle(action.text);
    setPendingActionId(action.id);
    setShowChecklistModal(true);
  };

  const handleChecklistSaved = async (checklistItemId: string) => {
    if (pendingActionId) await markActionAddedToChecklist(pendingActionId, checklistItemId);
    setPendingActionId(null);
    await loadMeeting();
  };

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.centered}><Text>Loading…</Text></View></SafeAreaView>;
  if (!meeting) return <SafeAreaView style={styles.container}><View style={styles.centered}><Text>Not found</Text><Pressable onPress={() => router.back()}><Text style={{ color: colors.accent }}>← Back</Text></Pressable></View></SafeAreaView>;

  const actions = meeting.actions ?? [];
  const meetingPeople = meeting.people ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></Pressable>
          <Pressable onPress={handleDelete}><Text style={styles.deleteText}>Delete</Text></Pressable>
        </View>

        <View style={styles.meetingCard}>
          <Text style={styles.meetingTitle}>{meeting.title || 'Untitled'}</Text>
          <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
          {meeting.meeting_type ? <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{meeting.meeting_type}</Text></View> : null}
        </View>

        {meetingPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>People present</Text>
            <View style={styles.peopleRow}>
              {meetingPeople.map((p) => (
                <Pressable key={p.id} style={styles.personChip} onPress={() => router.push(`/(tabs)/track/people/${p.id}` as any)}>
                  <Text style={styles.personChipText}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {meeting.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}><Text style={styles.notesText}>{meeting.notes}</Text></View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Action Items ({actions.length})</Text>
            <Pressable style={styles.addActionBtn} onPress={() => setShowAddAction(true)}>
              <Text style={styles.addActionBtnText}>+ Add</Text>
            </Pressable>
          </View>
          {actions.map((action) => (
            <View key={action.id} style={styles.actionRow}>
              <Pressable style={styles.actionCheckbox} onPress={async () => { await toggleMeetingAction(action.id, action.completed !== 1); await loadMeeting(); }}>
                <Text style={{ fontSize: 18 }}>{action.completed === 1 ? '✅' : '⬜'}</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionText, action.completed === 1 && { textDecorationLine: 'line-through', opacity: 0.5 }]}>{action.text}</Text>
                {action.added_to_checklist === 1 ? (
                  <View style={styles.checklistBadge}><Text style={styles.checklistBadgeText}>✅ In checklist</Text></View>
                ) : (
                  <Pressable style={styles.toChecklistBtn} onPress={() => handleAddToChecklist(action)}>
                    <Text style={styles.toChecklistBtnText}>→ Checklist</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <Modal visible={showAddAction} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={{ padding: spacing.lg }}>
            <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg }}>Add Action Item</Text>
            <TextInput style={[styles.input, { minHeight: 80 }]} value={actionText} onChangeText={setActionText} placeholder="What needs to happen?" placeholderTextColor={colors.text.muted} multiline autoFocus />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <Pressable style={styles.cancelBtn} onPress={() => { setShowAddAction(false); setActionText(''); }}>
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveModalBtn} onPress={handleAddAction} disabled={savingAction}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  deleteText: { color: colors.error, fontSize: typography.sizes.sm },
  meetingCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, borderRadius: radii.xl, padding: spacing.lg, ...shadows.md, marginBottom: spacing.lg },
  meetingTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  meetingDate: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.sm },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: colors.accentLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  typeBadgeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  section: { marginHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  addActionBtn: { backgroundColor: colors.accentLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.full },
  addActionBtnText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  peopleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personChip: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radii.full },
  personChipText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  notesCard: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  notesText: { fontSize: typography.sizes.sm, color: colors.text.secondary, lineHeight: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  actionCheckbox: { marginRight: spacing.sm, marginTop: 1 },
  actionText: { fontSize: typography.sizes.sm, color: colors.text.primary, marginBottom: spacing.xs },
  checklistBadge: { alignSelf: 'flex-start', backgroundColor: colors.success + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
  checklistBadgeText: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: '600' },
  toChecklistBtn: { alignSelf: 'flex-start', backgroundColor: colors.accentLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.sm },
  toChecklistBtnText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveModalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, backgroundColor: colors.accent, alignItems: 'center' },
});
