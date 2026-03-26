import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { colors, typography, spacing, radii, shadows, phaseConfig } from '../lib/theme';
import { getPhase, getDayNumber, getWeekNumber, getTodayString } from '../lib/utils';
import { dailyPrompts } from '../lib/prompts';
import { getLogForDate, saveLog, getRecentLogs, type DailyLog } from '../db/logsRepo';
import AddToChecklistModal from './AddToChecklistModal';
import { getAllMeetings, type Meeting } from '../db/meetingsRepo';
import { useRouter } from 'expo-router';

export default function ReflectContent() {
  const { settings, dayNumber, checklistItems } = useAppStore();
  const router = useRouter();
  const phaseKey = getPhase(dayNumber);
  const phase = phaseConfig[phaseKey];
  const weekNum = getWeekNumber(dayNumber);

  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);

  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureTitle, setCaptureTitle] = useState('');

  const todayPrompt = dailyPrompts.find((p) => p.day === dayNumber);

  const thisWeekItems = checklistItems
    .filter((i) => (i.scheduled_week ?? i.default_week) === weekNum)
    .slice(0, 5);

  const loadData = useCallback(async () => {
    try {
      const today = getTodayString();
      const log = await getLogForDate(today);
      if (log) {
        setTodayLog(log);
        setReflection(log.response ?? '');
      }
      const recent = await getRecentLogs(5);
      setRecentLogs(recent.filter((r) => r.date !== today));
      try {
        const meetings = await getAllMeetings();
        const sorted = meetings.sort((a, b) => b.date.localeCompare(a.date));
        setRecentMeetings(sorted.slice(0, 3));
      } catch (_) {}
    } catch (e) {
      console.error('Load reflect data error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = getTodayString();
      await saveLog({
        date: today,
        prompt_text: todayPrompt?.text ?? '',
        response: reflection,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await loadData();
    } catch (e) {
      console.error('Save log error:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCaptureAsAction = () => {
    const firstLine = reflection.trim().split('\n')[0].slice(0, 100);
    setCaptureTitle(firstLine || '');
    setShowCaptureModal(true);
  };

  const progressPct = Math.min(100, (dayNumber / 90) * 100);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.dayText}>Day {dayNumber} of 90</Text>
            <Text style={styles.phaseText}>{phase.icon} {phase.name}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: phase.color }]} />
          </View>
        </View>

        {/* Today's prompt */}
        {todayPrompt ? (
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>Today's prompt — Day {dayNumber}</Text>
            <Text style={styles.promptText}>{todayPrompt.text}</Text>
            <View style={styles.promptCategoryBadge}>
              <Text style={styles.promptCategoryText}>{todayPrompt.category}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.promptCard}>
            <Text style={styles.promptLabel}>Reflect</Text>
            <Text style={styles.promptText}>
              What are the most important things you've learned recently? What's working? What needs
              attention?
            </Text>
          </View>
        )}

        {/* Log entry */}
        <View style={styles.logCard}>
          <Text style={styles.logTitle}>Your reflection</Text>
          <TextInput
            style={styles.logInput}
            value={reflection}
            onChangeText={(text) => {
              setReflection(text);
              setSaved(false);
            }}
            placeholder="Write your reflection here..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save reflection'}
            </Text>
          </Pressable>
          {reflection.trim().length > 0 && (
            <Pressable style={styles.captureBtn} onPress={handleCaptureAsAction}>
              <Text style={styles.captureBtnText}>+ Capture as checklist action</Text>
            </Pressable>
          )}
        </View>

        {/* This week's focus */}
        {thisWeekItems.length > 0 && (
          <View style={styles.weekFocusCard}>
            <Text style={styles.sectionTitle}>This week's focus</Text>
            <Text style={styles.weekFocusSubtitle}>Week {weekNum} checklist items</Text>
            {thisWeekItems.map((item) => (
              <View key={item.id} style={styles.focusItem}>
                <Text style={styles.focusItemCheck}>
                  {item.completed === 1 ? '✅' : '⬜'}
                </Text>
                <Text
                  style={[
                    styles.focusItemTitle,
                    item.completed === 1 && styles.focusItemTitleDone,
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent meetings */}
        {recentMeetings.length > 0 && (
          <View style={styles.weekFocusCard}>
            <Text style={styles.sectionTitle}>Recent meetings</Text>
            {recentMeetings.map((meeting) => (
              <Pressable
                key={meeting.id}
                style={styles.meetingItem}
                onPress={() => router.push(`/(tabs)/meetings/${meeting.id}`)}
              >
                <Text style={styles.meetingDate}>{meeting.date}</Text>
                <Text style={styles.meetingTitle} numberOfLines={1}>
                  {meeting.title || 'Untitled meeting'}
                </Text>
                {meeting.notes ? (
                  <Text style={styles.meetingNotes} numberOfLines={1}>{meeting.notes}</Text>
                ) : null}
              </Pressable>
            ))}
            <Pressable style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/meetings')}>
              <Text style={styles.viewAllText}>View all meetings →</Text>
            </Pressable>
          </View>
        )}

        {/* Recent entries */}
        {recentLogs.length > 0 && (
          <View style={styles.recentCard}>
            <Text style={styles.sectionTitle}>Recent reflections</Text>
            {recentLogs.map((log) => (
              <View key={log.id} style={styles.recentEntry}>
                <Text style={styles.recentDate}>{log.date}</Text>
                {log.prompt_text ? (
                  <Text style={styles.recentPrompt} numberOfLines={1}>
                    {log.prompt_text}
                  </Text>
                ) : null}
                {log.response ? (
                  <Text style={styles.recentResponse} numberOfLines={2}>
                    {log.response}
                  </Text>
                ) : (
                  <Text style={styles.recentEmpty}>No entry</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Phase description */}
        <View style={[styles.phaseCard, { borderLeftColor: phase.color }]}>
          <Text style={styles.phaseCardTitle}>
            {phase.icon} {phase.name}
          </Text>
          <Text style={styles.phaseCardDesc}>{phase.description}</Text>
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <AddToChecklistModal
        visible={showCaptureModal}
        onClose={() => { setShowCaptureModal(false); setCaptureTitle(''); }}
        initialTitle={captureTitle}
        sourceLogDate={getTodayString()}
        sourceLabel={`Reflection on ${getTodayString()}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  phaseText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },

  promptCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  promptLabel: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: typography.sizes.lg,
    color: '#fff',
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
    marginBottom: spacing.md,
  },
  promptCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  promptCategoryText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  logCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  logTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    minHeight: 120,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.base,
  },

  weekFocusCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  weekFocusSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  focusItemCheck: { fontSize: 16, marginTop: 1 },
  focusItemTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  focusItemTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },

  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  recentCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  recentEntry: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentDate: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  recentPrompt: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  recentResponse: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  recentEmpty: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },

  phaseCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  phaseCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: 4,
  },
  phaseCardDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },

  meetingItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  meetingDate: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 2,
  },
  meetingTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  meetingNotes: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  viewAllBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  captureBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  captureBtnText: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
});
