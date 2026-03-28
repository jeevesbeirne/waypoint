import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { getStarsAssessment, saveStarsAssessment, type StarsAssessment } from '../../../../db/diagnosticsRepo';

const STARS_TYPES = [
  { key: 'startup_pct' as const, title: 'Start-up', emoji: '🚀', desc: 'Creating something new from scratch. Building structures, systems, and a team where none existed before.' },
  { key: 'turnaround_pct' as const, title: 'Turnaround', emoji: '🔧', desc: 'Rescuing an operation in trouble. Fast decisions, tough calls, rebuilding morale and competence.' },
  { key: 'accelerated_growth_pct' as const, title: 'Accelerated Growth', emoji: '📈', desc: 'Scaling something that\'s working. Adding structure without killing what made it succeed.' },
  { key: 'realignment_pct' as const, title: 'Realignment', emoji: '🧭', desc: 'Addressing problems people don\'t yet see. The hardest challenge: convincing people change is needed.' },
  { key: 'sustaining_pct' as const, title: 'Sustaining Success', emoji: '🏆', desc: 'Maintaining momentum and finding the next wave. Guard against complacency.' },
] as const;

type StarsPctKey = typeof STARS_TYPES[number]['key'];

export default function StarsScreen() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<StarsAssessment | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const data = await getStarsAssessment();
    if (data) {
      setAssessment(data);
      setNotes(data.notes ?? '');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getValue = (key: StarsPctKey): number => {
    if (!assessment) return 0;
    return (assessment as unknown as Record<string, number | string | null | undefined>)[key] as number ?? 0;
  };

  const handleChange = async (key: StarsPctKey, delta: number) => {
    const current = getValue(key);
    const next = Math.max(0, Math.min(100, current + delta));
    const update = { ...assessment, [key]: next };
    setAssessment(update as StarsAssessment);
    await saveStarsAssessment({ [key]: next });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await saveStarsAssessment({ notes });
    setSaving(false);
  };

  const total = STARS_TYPES.reduce((sum, s) => sum + getValue(s.key), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Diagnostics</Text></Pressable>
          <Text style={styles.heading}>STARS Mapping</Text>
          <View style={{ width: 80 }} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Most roles are a mix of STARS situations. Use the sliders below to map what percentage of your role falls into each category.
          </Text>
          <Text style={[styles.totalText, total > 100 && { color: colors.error }]}>
            Total: {total}% {total > 100 ? '(over 100%)' : total === 100 ? '✓' : ''}
          </Text>
        </View>

        {STARS_TYPES.map((star) => {
          const val = getValue(star.key);
          return (
            <View key={star.key} style={styles.starCard}>
              <Text style={styles.starTitle}>{star.emoji} {star.title}</Text>
              <Text style={styles.starDesc}>{star.desc}</Text>
              <View style={styles.sliderRow}>
                <Pressable style={styles.stepBtn} onPress={() => handleChange(star.key, -5)}>
                  <Text style={styles.stepBtnText}>−5</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => handleChange(star.key, -1)}>
                  <Text style={styles.stepBtnText}>−1</Text>
                </Pressable>
                <View style={styles.valueBox}>
                  <Text style={styles.valueText}>{val}%</Text>
                </View>
                <Pressable style={styles.stepBtn} onPress={() => handleChange(star.key, 1)}>
                  <Text style={styles.stepBtnText}>+1</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => handleChange(star.key, 5)}>
                  <Text style={styles.stepBtnText}>+5</Text>
                </Pressable>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, val)}%` }]} />
              </View>
            </View>
          );
        })}

        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>Your Diagnosis Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="What does your STARS mix mean for your approach?"
            placeholderTextColor={colors.text.muted}
            multiline
            textAlignVertical="top"
          />
          <Pressable style={styles.saveNotesBtn} onPress={handleSaveNotes}>
            <Text style={styles.saveNotesBtnText}>{saving ? 'Saving…' : 'Save Notes'}</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  infoCard: { backgroundColor: colors.accentLight, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radii.lg, marginBottom: spacing.md },
  infoText: { fontSize: typography.sizes.sm, color: colors.primary, lineHeight: 20 },
  totalText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.success, marginTop: spacing.sm },
  starCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  starTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  starDesc: { fontSize: typography.sizes.xs, color: colors.text.secondary, lineHeight: 16, marginBottom: spacing.sm },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  stepBtn: { backgroundColor: colors.border, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.md },
  stepBtnText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.text.primary },
  valueBox: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.md, minWidth: 60, alignItems: 'center' },
  valueText: { color: '#fff', fontWeight: '700', fontSize: typography.sizes.base },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.accent, borderRadius: radii.full },
  notesCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  notesLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  notesInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: typography.sizes.sm, color: colors.text.primary, minHeight: 100 },
  saveNotesBtn: { backgroundColor: colors.accent, paddingVertical: spacing.sm, borderRadius: radii.full, alignItems: 'center', marginTop: spacing.sm },
  saveNotesBtnText: { color: '#fff', fontWeight: '600' },
});
