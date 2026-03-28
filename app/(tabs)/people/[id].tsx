import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPeople, deletePerson, type Person } from '../../../db/peopleRepo';
import { getMeetingsForPerson, saveMeeting, type Meeting } from '../../../db/meetingsRepo';
import { useAppStore } from '../../../store';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';
import { formatDate, getTodayString } from '../../../lib/utils';
import ConversationsSection from '../../../components/ConversationsSection';
import AssessmentSection from '../../../components/AssessmentSection';

const MEETING_TYPES = ['1:1', 'Group meeting', 'Informal', 'Video call', 'Email / async'];

type DetailTab = 'overview' | 'conversations' | 'assessment';

export default function PersonDetailScreen() {
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
    try {
      const data = await getMeetingsForPerson(id);
      setMeetings(data);
    } catch (e) {
      console.error('Load meetings error:', e);
    }
  }, [id]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleSaveMeeting = async () => {
    if (!id) return;
    setSavingMeeting(true);
    try {
      await saveMeeting({
        person_id: id,
        date: meetingDate,
        meeting_type: meetingType,
        notes: meetingNotes,
      });
      await loadMeetings();
      setShowMeetingModal(false);
      setMeetingNotes('');
      setMeetingDate(getTodayString());
    } catch (e) {
      console.error('Save meeting error:', e);
      Alert.alert('Error', 'Could not save meeting.');
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete person',
      `Are you sure you want to delete ${person?.name}? This will also delete all their meetings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePerson(id);
              const updated = await getPeople();
              setPeople(updated);
              router.back();
            } catch (e) {
              Alert.alert('Error', 'Could not delete person.');
            }
          },
        },
      ]
    );
  };

  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Person not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </Pressable>
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerName} numberOfLines={1}>{person.name}</Text>
        <Pressable onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Person card */}
          <View style={styles.personCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{person.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.personName}>{person.name}</Text>
            {person.title ? <Text style={styles.personTitle}>{person.title}</Text> : null}
            {person.organisation && (
              <Text style={styles.personOrg}>{person.organisation}</Text>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{person.category}</Text>
            </View>

            {person.notes ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesSectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{person.notes}</Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Influence</Text>
                <Text style={styles.metaValue}>{person.influence}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Alignment</Text>
                <Text style={styles.metaValue}>{person.alignment}</Text>
              </View>
              {person.is_key_stakeholder === 1 && (
                <Text style={styles.keyBadge}>⭐ Key</Text>
              )}
            </View>
          </View>

          {/* Meetings section */}
          <View style={styles.meetingsHeader}>
            <Text style={styles.meetingsTitle}>Meetings ({meetings.length})</Text>
            <Pressable
              style={styles.newMeetingBtn}
              onPress={() => setShowMeetingModal(true)}
            >
              <Text style={styles.newMeetingBtnText}>+ New Meeting</Text>
            </Pressable>
          </View>

          {meetings.length === 0 ? (
            <View style={styles.noMeetings}>
              <Text style={styles.noMeetingsText}>No meetings logged yet</Text>
              <Pressable
                style={styles.firstMeetingBtn}
                onPress={() => setShowMeetingModal(true)}
              >
                <Text style={styles.firstMeetingBtnText}>Log your first meeting →</Text>
              </Pressable>
            </View>
          ) : (
            meetings.map((meeting) => (
              <Pressable
                key={meeting.id}
                style={styles.meetingCard}
                onPress={() => router.push(`/(tabs)/meetings/${meeting.id}`)}
              >
                <View style={styles.meetingCardHeader}>
                  <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
                  {meeting.meeting_type && (
                    <View style={styles.meetingTypeBadge}>
                      <Text style={styles.meetingTypeText}>{meeting.meeting_type}</Text>
                    </View>
                  )}
                  <Text style={styles.meetingChevron}>›</Text>
                </View>
                {meeting.title ? (
                  <Text style={styles.meetingTitleText} numberOfLines={1}>{meeting.title}</Text>
                ) : null}
                {meeting.notes ? (
                  <Text style={styles.meetingNotesText} numberOfLines={2}>{meeting.notes}</Text>
                ) : null}
              </Pressable>
            ))
          )}

          <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
      )}

      {activeTab === 'conversations' && (
        <ConversationsSection personId={id} category={person.category} />
      )}

      {activeTab === 'assessment' && !isBoss && (
        <AssessmentSection personId={id} personName={person.name} />
      )}

      {/* New Meeting Modal */}
      <Modal visible={showMeetingModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowMeetingModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>New Meeting</Text>
              <Pressable onPress={handleSaveMeeting} disabled={savingMeeting}>
                <Text style={[styles.modalSave, savingMeeting && { opacity: 0.5 }]}>
                  {savingMeeting ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.inputField}
              value={meetingDate}
              onChangeText={setMeetingDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text.muted}
            />

            <Text style={styles.inputLabel}>Meeting type</Text>
            <View style={styles.typeGrid}>
              {MEETING_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.typeOption, meetingType === type && styles.typeOptionSelected]}
                  onPress={() => setMeetingType(type)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      meetingType === type && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.inputField, styles.notesInput]}
              value={meetingNotes}
              onChangeText={setMeetingNotes}
              placeholder="What was discussed? Key outcomes? Actions agreed?"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.saveBtn, savingMeeting && { opacity: 0.6 }]}
              onPress={handleSaveMeeting}
              disabled={savingMeeting}
            >
              <Text style={styles.saveBtnText}>Save Meeting</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  headerName: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
  deleteText: { color: colors.error, fontSize: typography.sizes.sm },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: colors.text.secondary, marginBottom: spacing.md },
  backLink: { color: colors.accent },

  // Segmented control
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
    borderRadius: radii.lg,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },
  segmentTextActive: {
    color: colors.primary,
  },

  personCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  personName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  personTitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  personOrg: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  categoryBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  notesSection: {
    width: '100%',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesSectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    justifyContent: 'center',
  },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, marginBottom: 2 },
  metaValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  keyBadge: { fontSize: typography.sizes.sm, color: colors.accent },

  meetingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  meetingsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  newMeetingBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  newMeetingBtnText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },

  noMeetings: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noMeetingsText: { color: colors.text.muted, marginBottom: spacing.md },
  firstMeetingBtn: {},
  firstMeetingBtnText: { color: colors.accent, fontWeight: '600' },

  meetingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  meetingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  meetingDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  meetingTypeBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  meetingTypeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  meetingNotesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  meetingTitleText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  meetingChevron: {
    fontSize: 18,
    color: colors.text.muted,
    marginLeft: 'auto',
  },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalCancel: { color: colors.text.secondary, fontSize: typography.sizes.base },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  modalSave: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: '600' },
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
  notesInput: { minHeight: 120, paddingTop: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  typeOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeOptionText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  typeOptionTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
