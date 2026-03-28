import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllMeetings, saveMeeting, type Meeting } from '../../../../db/meetingsRepo';
import { getPeople, type Person } from '../../../../db/peopleRepo';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { formatDate, getTodayString } from '../../../../lib/utils';

const MEETING_TYPES = ['1:1', 'Group meeting', 'Informal', 'Video call', 'Email / async'];

export default function TrackMeetingsList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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
      setMeetings(m); setPeople(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = meetings.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.title ?? '').toLowerCase().includes(q) || (m.notes ?? '').toLowerCase().includes(q);
  });

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    setSaving(true);
    try {
      await saveMeeting({ title: title.trim(), date, meeting_type: meetingType, notes }, selectedPeopleIds);
      await loadData();
      setShowModal(false);
      setTitle(''); setDate(getTodayString()); setMeetingType('1:1'); setNotes(''); setSelectedPeopleIds([]);
    } catch (e) { Alert.alert('Error', 'Could not save meeting.'); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Track</Text></Pressable>
          <Text style={styles.heading}>Meetings</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ New</Text>
          </Pressable>
        </View>

        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search meetings..." placeholderTextColor={colors.text.muted} />

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No meetings yet</Text>
            <Text style={styles.emptyDesc}>Log your meetings to track conversations and capture follow-ups.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>+ Log your first meeting</Text>
            </Pressable>
          </View>
        ) : filtered.map((meeting) => (
          <Pressable key={meeting.id} style={styles.meetingCard} onPress={() => router.push(`/(tabs)/track/meetings/${meeting.id}` as any)}>
            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle} numberOfLines={1}>{meeting.title || 'Untitled meeting'}</Text>
              <Text style={styles.meetingDate}>{formatDate(meeting.date)}</Text>
              {meeting.meeting_type ? <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>{meeting.meeting_type}</Text></View> : null}
              {meeting.notes ? <Text style={styles.meetingNotes} numberOfLines={2}>{meeting.notes}</Text> : null}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowModal(false)}><Text style={{ color: colors.text.secondary }}>Cancel</Text></Pressable>
              <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary }}>New Meeting</Text>
              <Pressable onPress={handleSave}><Text style={{ color: colors.accent, fontWeight: '600' }}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
            </View>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. 1:1 with Sarah" placeholderTextColor={colors.text.muted} />
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.text.muted} />
            <Text style={styles.label}>Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {MEETING_TYPES.map((t) => (
                <Pressable key={t} style={[styles.chip, meetingType === t && styles.chipOn]} onPress={() => setMeetingType(t)}>
                  <Text style={[styles.chipText, meetingType === t && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            {people.length > 0 && (
              <>
                <Text style={styles.label}>People present</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {people.map((p) => (
                    <Pressable key={p.id} style={[styles.chip, selectedPeopleIds.includes(p.id) && styles.chipOn]}
                      onPress={() => setSelectedPeopleIds((prev) => prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id])}>
                      <Text style={[styles.chipText, selectedPeopleIds.includes(p.id) && styles.chipTextOn]}>{p.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, { minHeight: 160 }]} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" placeholder="What was discussed?" placeholderTextColor={colors.text.muted} />
            <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  addBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  addBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
  searchInput: { marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.text.primary },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  emptyDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
  meetingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  meetingInfo: { flex: 1 },
  meetingTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary, marginBottom: 2 },
  meetingDate: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.xs },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: colors.accentLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm, marginBottom: spacing.xs },
  typeBadgeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  meetingNotes: { fontSize: typography.sizes.xs, color: colors.text.muted, lineHeight: 16 },
  chevron: { fontSize: 22, color: colors.text.muted, marginLeft: spacing.sm },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  label: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: colors.accent, paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: '700' },
});
