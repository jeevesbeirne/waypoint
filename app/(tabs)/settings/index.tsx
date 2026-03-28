import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import DatePickerField from '../../../components/DatePickerField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import { saveSettings, getSettings } from '../../../db/settingsRepo';
import { getDayNumber } from '../../../lib/utils';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';
import { LEADER_LEVELS } from '../../../lib/constants';

const LINKS = [
  { label: 'The First 90 Days — Michael Watkins', url: 'https://amzn.to/3FirstNinetyDays' },
  { label: 'Harvard Business Review — Leadership', url: 'https://hbr.org/topic/leadership-transitions' },
  { label: 'McKinsey — Transition research', url: 'https://www.mckinsey.com/business-functions/people-and-organizational-performance/our-insights/how-new-ceos-can-boost-their-odds-of-success' },
  { label: 'Behavioural Insights Team', url: 'https://bi.team' },
];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function SettingsTab() {
  const { settings, setSettings, setDayNumber } = useAppStore();
  const router = useRouter();

  const [name, setName] = useState(settings?.name ?? '');
  const [roleTitle, setRoleTitle] = useState(settings?.role_title ?? '');
  const [orgName, setOrgName] = useState(settings?.org_name ?? '');
  const [startDate, setStartDate] = useState(settings?.start_date ?? '');
  const [leaderLevel, setLeaderLevel] = useState<string>(settings?.leader_level ?? 'manager');
  const [transitionSummary, setTransitionSummary] = useState(settings?.transition_summary ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name ?? '');
      setRoleTitle(settings.role_title ?? '');
      setOrgName(settings.org_name ?? '');
      setStartDate(settings.start_date ?? '');
      setLeaderLevel(settings.leader_level ?? 'manager');
      setTransitionSummary(settings.transition_summary ?? '');
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        name,
        role_title: roleTitle,
        org_name: orgName,
        start_date: startDate || null,
        leader_level: leaderLevel as any,
        transition_summary: transitionSummary,
        onboarding_complete: 1,
      });
      const updated = await getSettings();
      setSettings(updated);
      if (updated?.start_date) {
        setDayNumber(getDayNumber(updated.start_date));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save settings error:', e);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Settings</Text>

        {/* My Details */}
        <SectionHeader title="My Transition" />
        <SectionCard>
          <DatePickerField
            label="Start date"
            value={startDate}
            onChange={setStartDate}
          />

          <Text style={styles.fieldLabel}>Leader level</Text>
          <View style={styles.levelPicker}>
            {LEADER_LEVELS.map((level) => (
              <Pressable
                key={level.value}
                style={[
                  styles.levelOption,
                  leaderLevel === level.value && styles.levelOptionSelected,
                ]}
                onPress={() => setLeaderLevel(level.value)}
              >
                <Text
                  style={[
                    styles.levelOptionText,
                    leaderLevel === level.value && styles.levelOptionTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
            </Text>
          </Pressable>
        </SectionCard>

        {/* About This Transition */}
        <SectionHeader title="About This Transition" />
        <SectionCard>
          <Text style={styles.fieldLabel}>Your situation (free text)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={transitionSummary}
            onChangeText={setTransitionSummary}
            placeholder="e.g. Joining BIT as Director after 20 years in civil service — inheriting a team that needs strategic direction..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save'}</Text>
          </Pressable>
        </SectionCard>

        {/* App Information */}
        <SectionHeader title="About Waypoint" />
        <SectionCard>
          <Text style={styles.infoText}>
            Waypoint is a leadership transition companion built on evidence from the world's leading
            researchers in how leaders succeed in new roles.
          </Text>
          <Text style={styles.infoText}>
            It is not a generic to-do app. Every framework, article, and checklist item is grounded
            in peer-reviewed research and practitioner experience. Watkins, Harvard Business School,
            McKinsey, and the Behavioural Insights Team.
          </Text>
          <Text style={styles.versionText}>Version 2.0.0</Text>
        </SectionCard>

        {/* Upgrade */}
        <SectionHeader title="Unlock the Full Waypoint" />
        <SectionCard>
          <Text style={styles.upgradeText}>
            An AI-powered version of Waypoint is coming — dictate meeting notes, get personalised
            coaching, and auto-complete leadership models.
          </Text>
          <Pressable
            style={styles.upgradeBtn}
            onPress={() => Linking.openURL('mailto:hello@waypoint.app?subject=Waypoint%20Waitlist')}
          >
            <Text style={styles.upgradeBtnText}>Join the waitlist</Text>
          </Pressable>
          <Pressable style={[styles.upgradeBtn, styles.upgradeBtnSecondary]}>
            <Text style={styles.upgradeBtnTextSecondary}>Buy the app (coming soon)</Text>
          </Pressable>
        </SectionCard>

        {/* Learn More */}
        <SectionHeader title="Learn More" />
        <SectionCard>
          {LINKS.map((link, i) => (
            <Pressable
              key={i}
              style={styles.linkRow}
              onPress={() => Linking.openURL(link.url)}
            >
              <Text style={styles.linkText}>{link.label}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </Pressable>
          ))}
        </SectionCard>

        {/* About this app */}
        <SectionHeader title="About this app" />
        <SectionCard>
          <Text style={styles.infoText}>
            Want a refresher on how Waypoint works? View the introduction again.
          </Text>
          <Pressable
            style={styles.saveBtn}
            onPress={() => router.push('/intro' as any)}
          >
            <Text style={styles.saveBtnText}>View introduction again</Text>
          </Pressable>
        </SectionCard>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  heading: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textArea: { minHeight: 80, paddingTop: spacing.sm },
  levelPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  levelOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  levelOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelOptionText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  levelOptionTextSelected: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: { color: '#fff', fontWeight: typography.weights.semibold, fontSize: typography.sizes.base },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  upgradeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  upgradeBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  upgradeBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  upgradeBtnText: { color: '#fff', fontWeight: typography.weights.semibold },
  upgradeBtnTextSecondary: { color: colors.text.muted },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  linkArrow: { color: colors.accent },
});
