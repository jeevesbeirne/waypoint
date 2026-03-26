import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';

const features = [
  {
    emoji: '📚',
    title: 'Learn',
    desc: 'Evidence-based articles to guide your thinking at each phase of your transition.',
  },
  {
    emoji: '✅',
    title: 'Checklist',
    desc: 'Your structured 90-day action plan, week by week.',
  },
  {
    emoji: '💭',
    title: 'Reflect',
    desc: 'Daily prompts to help you pause, notice, and learn.',
  },
  {
    emoji: '👤',
    title: 'People',
    desc: 'Track the key people in your new organisation — their role, influence, and alignment.',
  },
  {
    emoji: '🗓️',
    title: 'Meetings',
    desc: 'Log meetings, link them to people, and capture follow-ups and action items.',
  },
  {
    emoji: '⚙️',
    title: 'Settings',
    desc: 'Your role details, preferences, and notifications.',
  },
];

export default function IntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Welcome to Waypoint</Text>

        <Text style={styles.body}>
          Congratulations on your new role. Whether you're preparing to step in, or you've already
          started, Waypoint is your 90-day leadership companion.
        </Text>

        <Text style={styles.body}>
          Waypoint is based on proven frameworks from Michael Watkins, Harvard Business Review, and
          McKinsey — the most researched approach to leadership transitions in the world.
        </Text>

        <View style={styles.frameworkBox}>
          <Text style={styles.frameworkTitle}>About the research</Text>
          <Text style={styles.frameworkBody}>
            Michael Watkins is a Harvard Business School professor who spent 20 years researching
            why some leaders succeed and others fail when starting new roles. His book{' '}
            <Text style={styles.frameworkItalic}>The First 90 Days</Text> (2003, updated 2013) is
            the most widely used leadership transition framework in the world — required reading at
            most top business schools and used by major corporations as standard onboarding
            practice.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  heading: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  frameworkBox: {
    backgroundColor: colors.accentLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  frameworkTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  frameworkBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  frameworkItalic: {
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureEmoji: {
    fontSize: 22,
    width: 36,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    ...shadows.md,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
