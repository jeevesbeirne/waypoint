import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import { getAllMeetings, saveMeeting, deleteMeeting, type Meeting } from '../../../db/meetingsRepo';
import { getPeople, type Person } from '../../../db/peopleRepo';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';
import { formatDate, getTodayString } from '../../../lib/utils';

const MEETING_TYPES = ['1:1', 'Group meeting', 'Informal', 'Video call', 'Email / async'];

export default function MeetingsTab() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Add meeting modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [meetingType, setMeetingType] = useState('1:1');
  const [notes, setNotes] = useState('');
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([getAllMeetings(), getPeople()]);
      setMeetings(m);
      setPeople(p);
    } catch (e) {
      console.error('Load meetings error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = meetings.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if ((m.title ?? '').toLowerCase().includes(q)) return true;
    if ((m.notes ?? '').toLowerCase().includes(q)) return true;
    return false;
  });

  const togglePerson = (pid: string) => {
    setSelectedPeopleIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for this meeting.');
      return;
    }
    setSaving(true);
    try {
      await saveMeeting(
        { title: title.trim(), date, meeting_type: meetingType, notes },
        selectedPeopleIds
      );
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (e) {
      console.error('Save meeting error:', e);
      Alert.alert('Error', 'Could not save meeting.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate(getTodayString());
    setMeetingType('1:1');
    setNotes('');
    setSelectedPeopleIds([]);
  };

  const getPeopleNames = (meetingId: string): string => {
    // We'll load people per meeting in detail view; show placeholder here
    return '';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading meetings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Meetings</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ New Meeting</Text>
          </Pressable>
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search meetings..."
          placeholderTextColor={colors.text.muted}
        />

        {/* Meetings list */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗓️</Text>
            <Text style={styles.emptyTitle}>No meetings yet</Text>
            <Text style={styles.emptyDesc}>
              Log your meetings to track conversations, capture follow-ups, and link them to people.
            </Text>
            <Pressable style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>+ Log your first meeting</Text>
            </Pressable>
          </View>
        ) : (
          filtered.map((meeting) => (
            <Pressable
              key={meeting.id}
              style={styles.meetingCard}
              onPress={() => router.push(`/(tabs)/meetings/${meeting.id}`)}
            >
              <View style={styles.meetingCardRow}>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingTitle} numberOfLines={1}>
                    {meeting.title || 'Untitled meeting'}
                  </Text>
                  <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
                  {meeting.meeting_type ? (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{meeting.meeting_type}</Text>
                    </View>
                  ) : null}
                  {meeting.notes ? (
                    <Text style={styles.meetingNotePreview} numberOfLines={2}>
                      {meeting.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* New Meeting Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>New Meeting</Text>
              <Pressable onPress={handleSave} disabled={saving}>
                <Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Title / Purpose *</Text>
            <TextInput
              style={styles.inputField}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. 1:1 with Sarah, Team standup..."
              placeholderTextColor={colors.text.muted}
            />

            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.inputField}
              value={date}
              onChangeText={setDate}
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
                  <Text style={[styles.typeOptionText, meetingType === type && styles.typeOptionTextSelected]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            {people.length > 0 && (
              <>
                <Text style={styles.inputLabel}>People present</Text>
                <Text style={styles.inputHint}>Tap to select people who were in this meeting</Text>
                <View style={styles.peopleGrid}>
                  {people.map((p) => (
                    <Pressable
                      key={p.id}
                      style={[
                        styles.personChip,
                        selectedPeopleIds.includes(p.id) && styles.personChipSelected,
                      ]}
                      onPress={() => togglePerson(p.id)}
                    >
                      <Text style={[
                        styles.personChipText,
                        selectedPeopleIds.includes(p.id) && styles.personChipTextSelected,
                      ]}>
                        {p.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.inputField, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="What was discussed? Key outcomes? Actions agreed?"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
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

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.text.muted, fontSize: typography.sizes.base },

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
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },

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
    lineHeight: typography.sizes.sm * 1.6,
    marginBottom: spacing.lg,
  },
  emptyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: typography.weights.semibold },

  meetingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  meetingCardRow: { flexDirection: 'row', alignItems: 'center' },
  meetingInfo: { flex: 1 },
  meetingTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  meetingDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  typeBadgeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  meetingNotePreview: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    lineHeight: typography.sizes.xs * 1.5,
  },
  chevron: { fontSize: 22, color: colors.text.muted, marginLeft: spacing.sm },

  // Modal
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
  inputHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
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
  notesInput: { minHeight: 160, paddingTop: spacing.sm },

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

  peopleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  personChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  personChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  personChipText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  personChipTextSelected: { color: '#fff', fontWeight: '600' },

  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
