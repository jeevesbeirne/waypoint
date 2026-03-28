import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import { colors, typography, spacing, radii, shadows, phaseConfig } from '../../../lib/theme';
import { getPhase, getWeekNumber, getTodayString } from '../../../lib/utils';
import { dailyPrompts } from '../../../lib/prompts';
import { getLogForDate, saveLog, getRecentLogs, type DailyLog } from '../../../db/logsRepo';
import AddToChecklistModal from '../../../components/AddToChecklistModal';

export default function TrackReflect() {
  const router = useRouter();
  const { settings, dayNumber, checklistItems } = useAppStore();
  const phaseKey = getPhase(dayNumber);
  const phase = phaseConfig[phaseKey];
  const weekNum = getWeekNumber(dayNumber);

  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [reflection, setReflection] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
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
      if (log) { setTodayLog(log); setReflection(log.response ?? ''); }
      const recent = await getRecentLogs(5);
      setRecentLogs(recent.filter((r) => r.date !== today));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const today = getTodayString();
      await saveLog({ date: today, prompt_text: todayPrompt?.text ?? '', response: reflection });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const progressPct = Math.min(100, (dayNumber / 90) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Track</Text></Pressable>
          <Text style={styles.heading}>Reflect</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.progressHeader}>
          <View style={styles.headerRow}>
            <Text style={styles.dayText}>Day {dayNumber} of 90</Text>
            <Text style={styles.phaseText}>{phase.icon} {phase.name}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: phase.color }]} />
          </View>
        </View>

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
            <Text style={styles.promptText}>What are the most important things you've learned recently?</Text>
          </View>
        )}

        <View style={styles.logCard}>
          <Text style={styles.logTitle}>Your reflection</Text>
          <TextInput
            style={styles.logInput}
            value={reflection}
            onChangeText={(text) => { setReflection(text); setSaved(false); }}
            placeholder="Write your reflection here..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : saving ? 'Saving…' : 'Save reflection'}</Text>
          </Pressable>
          {reflection.trim().length > 0 && (
            <Pressable style={styles.captureBtn} onPress={() => { setCaptureTitle(reflection.trim().split('\n')[0].slice(0, 100)); setShowCaptureModal(true); }}>
              <Text style={styles.captureBtnText}>+ Capture as checklist action</Text>
            </Pressable>
          )}
        </View>

        {thisWeekItems.length > 0 && (
          <View style={styles.focusCard}>
            <Text style={styles.sectionTitle}>This week's focus</Text>
            {thisWeekItems.map((item) => (
              <View key={item.id} style={styles.focusItem}>
                <Text style={{ fontSize: 16 }}>{item.completed === 1 ? '✅' : '⬜'}</Text>
                <Text style={[styles.focusItemTitle, item.completed === 1 && { textDecorationLine: 'line-through', color: colors.text.muted }]} numberOfLines={2}>{item.title}</Text>
              </View>
            ))}
          </View>
        )}

        {recentLogs.length > 0 && (
          <View style={styles.recentCard}>
            <Text style={styles.sectionTitle}>Recent reflections</Text>
            {recentLogs.map((log) => (
              <View key={log.id} style={styles.recentEntry}>
                <Text style={styles.recentDate}>{log.date}</Text>
                {log.prompt_text ? <Text style={styles.recentPrompt} numberOfLines={1}>{log.prompt_text}</Text> : null}
                {log.response ? <Text style={styles.recentResponse} numberOfLines={2}>{log.response}</Text> : <Text style={styles.recentEmpty}>No entry</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <AddToChecklistModal
        visible={showCaptureModal}
        onClose={() => { setShowCaptureModal(false); setCaptureTitle(''); }}
        initialTitle={captureTitle}
        sourceLogDate={getTodayString()}
        sourceLabel={`Reflection on ${getTodayString()}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  progressHeader: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dayText: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  phaseText: { fontSize: typography.sizes.sm, color: colors.text.secondary },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.full },
  promptCard: { backgroundColor: colors.primary, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.xl, padding: spacing.lg },
  promptLabel: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  promptText: { fontSize: typography.sizes.lg, color: '#fff', fontWeight: '500', lineHeight: 24, marginBottom: spacing.md },
  promptCategoryBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full },
  promptCategoryText: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  logCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.xl, padding: spacing.lg, ...shadows.md },
  logTitle: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  logInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: typography.sizes.base, color: colors.text.primary, minHeight: 120, marginBottom: spacing.md, backgroundColor: colors.background },
  saveBtn: { backgroundColor: colors.accent, paddingVertical: spacing.sm, borderRadius: radii.full, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: typography.sizes.base },
  captureBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm, borderRadius: radii.full, borderWidth: 1, borderColor: colors.accent, alignItems: 'center' },
  captureBtnText: { color: colors.accent, fontWeight: '600', fontSize: typography.sizes.sm },
  focusCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.xl, padding: spacing.lg, ...shadows.sm },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  focusItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs, gap: spacing.sm },
  focusItemTitle: { flex: 1, fontSize: typography.sizes.sm, color: colors.text.primary },
  recentCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.xl, padding: spacing.lg, ...shadows.sm },
  recentEntry: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentDate: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.accent, marginBottom: 4 },
  recentPrompt: { fontSize: typography.sizes.xs, color: colors.text.muted, fontStyle: 'italic', marginBottom: 4 },
  recentResponse: { fontSize: typography.sizes.sm, color: colors.text.secondary, lineHeight: 20 },
  recentEmpty: { fontSize: typography.sizes.xs, color: colors.text.muted, fontStyle: 'italic' },
});
