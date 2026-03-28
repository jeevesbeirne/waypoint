import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../lib/theme';
import { useAppStore } from '../../store';
import { saveSettings } from '../../db/settingsRepo';
import { getDayNumber } from '../../lib/utils';
import DatePickerField from '../../components/DatePickerField';

const LEADER_LEVELS = [
  { value: 'ic', label: 'First-Time Leader', desc: 'New to leading a team for the first time' },
  { value: 'team_lead', label: 'Team Lead', desc: 'Leading a small team' },
  { value: 'manager', label: 'Manager', desc: 'Managing a team' },
  { value: 'director', label: 'Senior Manager / Director', desc: 'Cross-functional leadership' },
  { value: 'executive', label: 'Executive / C-Suite', desc: 'Senior leadership, board-level' },
];

export default function RoleSetupScreen() {
  const router = useRouter();
  const setSettings = useAppStore((s) => s.setSettings);
  const setDayNumber = useAppStore((s) => s.setDayNumber);

  const [startDate, setStartDate] = useState('');
  const [leaderLevel, setLeaderLevel] = useState<string>('manager');

  const handleNext = async () => {
    const settings = {
      start_date: startDate || null,
      leader_level: leaderLevel as any,
      onboarding_complete: 1,
    };
    await saveSettings(settings);
    const savedSettings = { ...settings, id: 1 };
    setSettings(savedSettings as any);
    if (savedSettings.start_date) {
      setDayNumber(getDayNumber(savedSettings.start_date));
    }
    router.replace('/(tabs)/learn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Set up your timeline</Text>
        <Text style={styles.subheading}>
          Tell Waypoint when you start and your seniority level. This drives your personalised 90-day plan.
        </Text>

        <View style={styles.section}>
          <DatePickerField
            label="Start date"
            value={startDate}
            onChange={setStartDate}
            hint="This is used to calculate your 90-day timeline and personalise your checklist."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your leader level</Text>
          {LEADER_LEVELS.map((level) => (
            <Pressable
              key={level.value}
              style={[
                styles.levelOption,
                leaderLevel === level.value && styles.levelOptionSelected,
              ]}
              onPress={() => setLeaderLevel(level.value)}
            >
              <View style={styles.levelOptionInner}>
                <View
                  style={[
                    styles.radio,
                    leaderLevel === level.value && styles.radioSelected,
                  ]}
                />
                <View style={styles.levelText}>
                  <Text
                    style={[
                      styles.levelLabel,
                      leaderLevel === level.value && styles.levelLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.levelDesc}>{level.desc}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing['3xl'] },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  heading: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  section: { marginBottom: spacing.lg },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  levelOption: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  levelOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  levelOptionInner: { flexDirection: 'row', alignItems: 'flex-start' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  levelText: { flex: 1 },
  levelLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  levelLabelSelected: { color: colors.primary },
  levelDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
