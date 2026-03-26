import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ARTICLES } from '../../../../lib/learningContent';
import { colors, typography, spacing, radii } from '../../../../lib/theme';

/** Render a string that may contain **bold** segments as inline Text */
function InlineText({ text, style }: { text: string; style?: object }) {
  // Split on **...** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) {
    return <Text style={style}>{text}</Text>;
  }
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={[style, { fontWeight: 'bold', color: colors.primary }]}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const article = ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Article not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>← Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const paragraphs = article.fullText.split('\n\n').filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Learn</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.meta}>
            <Text style={styles.readTime}>{article.readTimeMinutes} min read</Text>
            <Text style={styles.phase}>{article.phase.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{article.title}</Text>
        </View>

        {/* Summary bullets */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Key takeaways</Text>
          {article.summaryBullets.map((bullet, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <InlineText text={bullet} style={styles.bulletText} />
            </View>
          ))}
        </View>

        {/* Full text */}
        <View style={styles.body}>
          {paragraphs.map((para, i) => {
            // Markdown ### heading
            if (para.startsWith('### ')) {
              return (
                <Text key={i} style={styles.heading3}>
                  {para.slice(4).trim()}
                </Text>
              );
            }
            // Markdown ## heading
            if (para.startsWith('## ')) {
              return (
                <Text key={i} style={styles.heading2}>
                  {para.slice(3).trim()}
                </Text>
              );
            }
            // A paragraph that is ENTIRELY bold (heading)
            if (/^\*\*[^*]+\*\*$/.test(para.trim())) {
              const cleaned = para.trim().slice(2, -2);
              return (
                <Text key={i} style={styles.heading2}>
                  {cleaned}
                </Text>
              );
            }
            // A paragraph that STARTS with bold label like **Label:** text
            if (para.startsWith('**')) {
              return (
                <InlineText key={i} text={para} style={styles.paragraph} />
              );
            }
            // Bullet list paragraph
            if (para.startsWith('- ') || para.startsWith('• ')) {
              const items = para.split('\n').filter(Boolean);
              return (
                <View key={i} style={styles.listBlock}>
                  {items.map((item, j) => (
                    <View key={j} style={styles.listRow}>
                      <Text style={styles.listDot}>•</Text>
                      <InlineText
                        text={item.replace(/^[-•]\s/, '')}
                        style={styles.listItem}
                      />
                    </View>
                  ))}
                </View>
              );
            }
            return (
              <InlineText key={i} text={para} style={styles.paragraph} />
            );
          })}
        </View>

        {/* Sources */}
        {article.sources.length > 0 && (
          <View style={styles.sourcesBlock}>
            <Text style={styles.sourcesTitle}>Sources</Text>
            {article.sources.map((s, i) => (
              <Text key={i} style={styles.sourceItem}>
                {i + 1}. {s}
              </Text>
            ))}
          </View>
        )}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['2xl'] },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: colors.text.secondary, marginBottom: spacing.md },
  backLink: { color: colors.accent },

  header: { marginBottom: spacing.xl },
  meta: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  readTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  phase: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.accentLight,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    lineHeight: typography.sizes['2xl'] * 1.25,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  summaryTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  bulletRow: { flexDirection: 'row', marginBottom: spacing.xs, alignItems: 'flex-start' },
  bulletDot: { color: colors.accent, marginRight: spacing.sm, fontWeight: 'bold', marginTop: 2 },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  body: {},
  heading2: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  heading3: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  paragraph: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  listBlock: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', marginBottom: spacing.xs },
  listDot: { color: colors.accent, marginRight: spacing.sm, fontWeight: 'bold' },
  listItem: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  sourcesBlock: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourcesTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sourceItem: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
});
