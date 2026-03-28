import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';

const CARDS = [
  { key: 'swot', emoji: '📊', title: 'SWOT Analysis', desc: 'Strengths, Weaknesses, Opportunities, Threats', route: '/(tabs)/track/diagnostics/swot' },
  { key: 'porter', emoji: '⚡', title: "Porter's Five Forces", desc: 'Competitive landscape analysis', route: '/(tabs)/track/diagnostics/porter' },
  { key: 'stars', emoji: '⭐', title: 'STARS Mapping', desc: 'Diagnose your situation type', route: '/(tabs)/track/diagnostics/stars' },
  { key: 'notes', emoji: '📝', title: 'General Notes', desc: 'Free-form diagnostic observations', route: '/(tabs)/track/diagnostics/notes' },
] as const;

export default function DiagnosticsHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Track</Text>
          </Pressable>
          <Text style={styles.heading}>Diagnostics</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.subheading}>Structured frameworks to diagnose your situation</Text>

        {CARDS.map((card) => (
          <Pressable key={card.key} style={styles.card} onPress={() => router.push(card.route as any)}>
            <Text style={styles.cardEmoji}>{card.emoji}</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xs },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  subheading: { fontSize: typography.sizes.sm, color: colors.text.secondary, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.xl, padding: spacing.lg, ...shadows.md,
  },
  cardEmoji: { fontSize: 32, marginRight: spacing.md },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  cardDesc: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  chevron: { fontSize: 24, color: colors.text.muted },
});
