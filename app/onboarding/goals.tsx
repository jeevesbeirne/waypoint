import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '../../lib/theme';
import { saveSettings } from '../../db/settingsRepo';
import { useAppStore } from '../../store';
import { getDayNumber } from '../../lib/utils';

export default function GoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const setSettings = useAppStore((s) => s.setSettings);
  const setDayNumber = useAppStore((s) => s.setDayNumber);

  const [goal1, setGoal1] = useState('');
  const [goal2, setGoal2] = useState('');
  const [goal3, setGoal3] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const settings = {
        name: String(params.name ?? ''),
        role_title: String(params.roleTitle ?? ''),
        org_name: String(params.orgName ?? ''),
        start_date: String(params.startDate ?? '') || null,
        leader_level: String(params.leaderLevel ?? 'manager') as any,
        transition_summary: [goal1, goal2, goal3].filter(Boolean).join('\n'),
        onboarding_complete: 1,
      };
      await saveSettings(settings);
      const savedSettings = { ...settings, id: 1 };
      setSettings(savedSettings as any);
      if (savedSettings.start_date) {
        setDayNumber(getDayNumber(savedSettings.start_date));
      }
      router.replace('/(tabs)/learn');
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Could not save your settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Your goals</Text>
        <Text style={styles.subheading}>
          What are the 2-3 things you most want to achieve in your first 90 days? You can be
          specific or broad — this is just for you.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Goal 1</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={goal1}
            onChangeText={setGoal1}
            placeholder="e.g. Build strong relationships with my team and understand what they need from me"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal 2</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={goal2}
            onChangeText={setGoal2}
            placeholder="e.g. Deliver one visible early win in the first 30 days"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal 3 (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={goal3}
            onChangeText={setGoal3}
            placeholder="e.g. Understand the organisation's strategy and how my role fits"
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.skipNote}>
          <Text style={styles.skipText}>
            💡 You can skip this — goals can be set or updated later in the Reflect tab.
          </Text>
        </View>

        <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={handleFinish} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Setting up…' : 'Start your journey →'}</Text>
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
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
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
  textArea: { minHeight: 80, paddingTop: spacing.sm },
  skipNote: {
    backgroundColor: colors.accentLight,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  skipText: { fontSize: typography.sizes.sm, color: colors.primary },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: colors.surface,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
