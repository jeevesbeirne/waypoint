import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';

const SECTIONS = [
  { key: 'people', emoji: '👤', title: 'People', desc: 'Manage stakeholders, direct reports, and key relationships', route: '/(tabs)/track/people' },
  { key: 'diagnostics', emoji: '🔍', title: 'Diagnostics', desc: 'SWOT, Porter\'s Five Forces, STARS mapping', route: '/(tabs)/track/diagnostics' },
  { key: 'strategy', emoji: '🎯', title: 'Strategy &\nAlignment', desc: 'Vision, mission, strategies, alignment, early wins', route: '/(tabs)/track/strategy' },
  { key: 'meetings', emoji: '📝', title: 'Meetings', desc: 'Log and review your meetings and conversations', route: '/(tabs)/track/meetings' },
] as const;

export default function TrackHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Track</Text>
        <Text style={styles.subheading}>Your transition toolkit</Text>

        <View style={styles.grid}>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.key}
              style={styles.card}
              onPress={() => router.push(section.route as any)}
            >
              <Text style={styles.cardEmoji}>{section.emoji}</Text>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardDesc}>{section.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Daily Reflection — full width */}
        <Pressable
          style={styles.reflectCard}
          onPress={() => router.push('/(tabs)/track/reflect' as any)}
        >
          <Text style={styles.reflectEmoji}>💭</Text>
          <View style={styles.reflectContent}>
            <Text style={styles.reflectTitle}>Daily Reflection</Text>
            <Text style={styles.reflectDesc}>Reflect on your day, capture insights, track your energy</Text>
          </View>
          <Text style={styles.reflectChevron}>›</Text>
        </Pressable>

        <View style={{ height: spacing['2xl'] }} />
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
  },
  subheading: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
    minHeight: 160,
  },
  cardEmoji: { fontSize: 32, marginBottom: spacing.sm },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.sizes.xs * 1.5,
  },
  reflectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  reflectEmoji: { fontSize: 32, marginRight: spacing.md },
  reflectContent: { flex: 1 },
  reflectTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  reflectDesc: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  reflectChevron: { fontSize: 24, color: colors.accent },
});
