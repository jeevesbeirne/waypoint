import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPeople, deletePerson, type Person } from '../../../../db/peopleRepo';
import { getMeetingsForPerson, saveMeeting, type Meeting } from '../../../../db/meetingsRepo';
import { useAppStore } from '../../../../store';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { formatDate, getTodayString } from '../../../../lib/utils';
import ConversationsSection from '../../../../components/ConversationsSection';
import AssessmentSection from '../../../../components/AssessmentSection';

const MEETING_TYPES = ['1:1', 'Group meeting', 'Informal', 'Video call', 'Email / async'];

type DetailTab = 'overview' | 'conversations' | 'assessment';

export default function TrackPersonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { people, setPeople } = useAppStore();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState(getTodayString());
  const [meetingType, setMeetingType] = useState('1:1');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const person = people.find((p) => p.id === id);
  const isBoss = person?.category === 'Boss / Line Manager';

  const loadMeetings = useCallback(async () => {
    if (!id) return;
    try { setMeetings(await getMeetingsForPerson(id)); } catch (e) { console.error(e); }
  }, [id]);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const handleSaveMeeting = async () => {
    if (!id) return;
    setSavingMeeting(true);
    try {
      await saveMeeting({ person_id: id, date: meetingDate, meeting_type: meetingType, notes: meetingNotes });
      await loadMeetings();
      setShowMeetingModal(false);
      setMeetingNotes('');
      setMeetingDate(getTodayString());
    } catch (e) { Alert.alert('Error', 'Could not save meeting.'); }
    finally { setSavingMeeting(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete person', `Delete ${person?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deletePerson(id);
        setPeople(await getPeople());
        router.back();
      }},
    ]);
  };

  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>Person not found</Text>
          <Pressable onPress={() => router.back()}><Text style={{ color: colors.accent }}>← Back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'conversations', label: 'Conversations' },
    ...(!isBoss ? [{ key: 'assessment' as DetailTab, label: 'Assessment' }] : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Back</Text></Pressable>
        <Text style={styles.headerName} numberOfLines={1}>{person.name}</Text>
        <Pressable onPress={handleDelete}><Text style={styles.deleteText}>Delete</Text></Pressable>
      </View>

      <View style={styles.segmentBar}>
        {tabs.map((tab) => (
          <Pressable key={tab.key} style={[styles.segment, activeTab === tab.key && styles.segmentActive]} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'overview' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.personCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{person.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.personName}>{person.name}</Text>
            {person.title && <Text style={styles.personTitle}>{person.title}</Text>}
            {person.organisation && <Text style={styles.personOrg}>{person.organisation}</Text>}
            <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{person.category}</Text></View>
            {person.notes ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesSectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{person.notes}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}><Text style={styles.metaLabel}>Influence</Text><Text style={styles.metaValue}>{person.influence}</Text></View>
              <View style={styles.metaItem}><Text style={styles.metaLabel}>Alignment</Text><Text style={styles.metaValue}>{person.alignment}</Text></View>
              {person.is_key_stakeholder === 1 && <Text style={styles.keyBadge}>⭐ Key</Text>}
            </View>
          </View>

          <View style={styles.meetingsHeader}>
            <Text style={styles.meetingsTitle}>Meetings ({meetings.length})</Text>
            <Pressable style={styles.newMeetingBtn} onPress={() => setShowMeetingModal(true)}>
              <Text style={styles.newMeetingBtnText}>+ New</Text>
            </Pressable>
          </View>
          {meetings.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Text style={{ color: colors.text.muted }}>No meetings logged yet</Text>
            </View>
          ) : meetings.map((meeting) => (
            <Pressable key={meeting.id} style={styles.meetingCard} onPress={() => router.push(`/(tabs)/track/meetings/${meeting.id}` as any)}>
              <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
              {meeting.title && <Text style={styles.meetingTitleText} numberOfLines={1}>{meeting.title}</Text>}
              {meeting.notes && <Text style={styles.meetingNotesText} numberOfLines={2}>{meeting.notes}</Text>}
            </Pressable>
          ))}
          <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
      )}

      {activeTab === 'conversations' && <ConversationsSection personId={id} category={person.category} />}
      {activeTab === 'assessment' && !isBoss && <AssessmentSection personId={id} personName={person.name} />}

      <Modal visible={showMeetingModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowMeetingModal(false)}><Text style={{ color: colors.text.secondary }}>Cancel</Text></Pressable>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary }}>New Meeting</Text>
              <Pressable onPress={handleSaveMeeting}><Text style={{ color: colors.accent, fontWeight: '600' }}>{savingMeeting ? 'Saving…' : 'Save'}</Text></Pressable>
            </View>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput style={styles.inputField} value={meetingDate} onChangeText={setMeetingDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.text.muted} />
            <Text style={styles.inputLabel}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {MEETING_TYPES.map((t) => (
                <Pressable key={t} style={[styles.typeChip, meetingType === t && styles.typeChipOn]} onPress={() => setMeetingType(t)}>
                  <Text style={[styles.typeChipText, meetingType === t && styles.typeChipTextOn]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.inputField, { minHeight: 120 }]} value={meetingNotes} onChangeText={setMeetingNotes} multiline textAlignVertical="top" placeholder="What was discussed?" placeholderTextColor={colors.text.muted} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  headerName: { flex: 1, textAlign: 'center', fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary, marginHorizontal: spacing.sm },
  deleteText: { color: colors.error, fontSize: typography.sizes.sm },
  segmentBar: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.border, borderRadius: radii.lg, padding: 3 },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.md, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text.muted },
  segmentTextActive: { color: colors.primary },
  personCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center', ...shadows.md, marginBottom: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.accent },
  personName: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  personTitle: { fontSize: typography.sizes.base, color: colors.text.secondary, marginBottom: 2 },
  personOrg: { fontSize: typography.sizes.sm, color: colors.text.muted, marginBottom: spacing.sm },
  categoryBadge: { backgroundColor: colors.accentLight, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.full, marginBottom: spacing.md },
  categoryBadgeText: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: '600' },
  notesSection: { width: '100%', marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  notesSectionTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  notesText: { fontSize: typography.sizes.sm, color: colors.text.secondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, width: '100%', justifyContent: 'center' },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, marginBottom: 2 },
  metaValue: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.primary, textTransform: 'capitalize' },
  keyBadge: { fontSize: typography.sizes.sm, color: colors.accent },
  meetingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  meetingsTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary },
  newMeetingBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  newMeetingBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
  meetingCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  meetingDate: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.primary, marginBottom: 2 },
  meetingTitleText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.primary, marginBottom: 2 },
  meetingNotesText: { fontSize: typography.sizes.xs, color: colors.text.muted },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  inputLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
  inputField: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  typeChip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  typeChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  typeChipTextOn: { color: '#fff', fontWeight: '600' },
});
