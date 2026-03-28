import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import { colors, typography, spacing, radii, shadows, phaseConfig } from '../../../lib/theme';
import { getPhase, getWeekNumber } from '../../../lib/utils';
import { ARTICLES, CATEGORY_LABELS } from '../../../lib/learningContent';
import type { Article } from '../../../lib/learningContent';

const FRAMEWORK_BANNER_KEY = 'waypoint_framework_banner_seen';

function FrameworkIntro() {
  // Default to expanded; collapse after user has seen it once
  const [expanded, setExpanded] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FRAMEWORK_BANNER_KEY).then((val) => {
      if (val === 'collapsed') {
        setExpanded(false);
      }
      setLoaded(true);
    });
  }, []);

  const handleCollapse = async () => {
    setExpanded(false);
    await AsyncStorage.setItem(FRAMEWORK_BANNER_KEY, 'collapsed');
  };

  const handleExpand = async () => {
    setExpanded(true);
    // Don't reset persisted state — let it re-collapse next time
  };

  if (!loaded) return null;

  return (
    <View style={frameworkStyles.container}>
      <Pressable style={frameworkStyles.header} onPress={expanded ? handleCollapse : handleExpand}>
        <Text style={frameworkStyles.title}>📖 About the research</Text>
        <Text style={frameworkStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        <View style={frameworkStyles.body}>
          <Text style={frameworkStyles.text}>
            <Text style={frameworkStyles.bold}>Who is Michael Watkins?</Text>{' '}
            Michael Watkins is a Harvard Business School professor who spent over 20 years
            researching why leaders succeed or fail when they start new roles. His book{' '}
            <Text style={frameworkStyles.italic}>The First 90 Days</Text> (2003, updated 2013) is
            the most widely read leadership transition framework in the world — used by major
            corporations and taught at leading business schools globally. The research in this app
            also draws on findings from Harvard Business Review and McKinsey &amp; Company.
          </Text>
          <Pressable onPress={handleCollapse}>
            <Text style={frameworkStyles.collapse}>Collapse ▲</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const frameworkStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.accentLight,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  chevron: { color: colors.accent, fontSize: typography.sizes.xs, fontWeight: 'bold' },
  body: { padding: spacing.md },
  text: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },
  italic: { fontStyle: 'italic' },
  bold: { fontWeight: typography.weights.bold },
  collapse: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

const CATEGORIES = [
  { key: 'prepare', label: '1. Prepare Yourself' },
  { key: 'learning', label: '2. Accelerate Your Learning' },
  { key: 'situation', label: '3. Match Strategy to Situation' },
  { key: 'negotiate', label: '4. Negotiate Success' },
  { key: 'early-wins', label: '5. Secure Early Wins' },
  { key: 'alignment', label: '6. Achieve Alignment' },
  { key: 'team', label: '7. Build Your Team' },
  { key: 'coalitions', label: '8. Create Coalitions' },
  { key: 'balance', label: '9. Keep Your Balance' },
  { key: 'accelerate', label: '10. Accelerate Everyone' },
] as const;

const TRANSITION_BANNER_KEY = 'waypoint_transition_banner_seen';

const TRANSITION_STAGES = [
  {
    title: 'Before you start',
    text: 'The period before Day 1. You have no access, no authority, and no insider knowledge — but you can prepare yourself mentally, research the organisation from public sources, and plan how you\'ll approach your first weeks.',
  },
  {
    title: 'Month 1 — Learn and Listen (Days 1-30)',
    text: 'Your job is to learn, not to act. Run a structured listening tour. Meet your direct reports, your boss, your peers, and key stakeholders. Ask questions. Resist the urge to make changes until you understand the context. Complete your situational diagnosis using the STARS framework.',
  },
  {
    title: 'Month 2 — Build and Connect (Days 31-60)',
    text: 'Start delivering early wins. Deepen key relationships — especially with your boss and coalition members. Assess your team honestly. Have the difficult conversations you\'ve been postponing. Negotiate for the resources you need.',
  },
  {
    title: 'Month 3 — Deliver and Lead (Days 61-90)',
    text: 'Drive momentum on your strategic priorities. Build the team and culture you want. Strengthen your stakeholder network beyond your immediate circle. Write your 90-day narrative — the story of what you\'ve learned, what you\'ve achieved, and where you\'re heading.',
  },
];

function TransitionThinking() {
  const [expanded, setExpanded] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TRANSITION_BANNER_KEY).then((val) => {
      if (val === 'collapsed') setExpanded(false);
      setLoaded(true);
    });
  }, []);

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) await AsyncStorage.setItem(TRANSITION_BANNER_KEY, 'collapsed');
  };

  if (!loaded) return null;

  return (
    <View style={transitionStyles.container}>
      <Pressable style={transitionStyles.header} onPress={handleToggle}>
        <Text style={transitionStyles.title}>🧭 How to think about your transition</Text>
        <Text style={transitionStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        <View style={transitionStyles.body}>
          <Text style={transitionStyles.intro}>Think of your transition in four stages:</Text>
          {TRANSITION_STAGES.map((stage, i) => (
            <View key={i} style={transitionStyles.stageBlock}>
              <Text style={transitionStyles.stageTitle}>{stage.title}</Text>
              <Text style={transitionStyles.stageText}>{stage.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const transitionStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#fff',
    flex: 1,
  },
  chevron: { color: colors.accent, fontSize: typography.sizes.xs, fontWeight: 'bold' },
  body: { padding: spacing.md },
  intro: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  stageBlock: { marginBottom: spacing.md },
  stageTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stageText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
});

export default function LearnTab() {
  const router = useRouter();
  const { dayNumber, settings } = useAppStore();
  const hasStartDate = Boolean(settings?.start_date);
  const phaseKey = getPhase(dayNumber);
  const weekNum = getWeekNumber(dayNumber);
  const phase = phaseConfig[phaseKey];
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['prepare']));
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  // Determine the correct phase heading
  const showPrepare = !hasStartDate || dayNumber <= 0;
  const phaseName = showPrepare ? 'Prepare Yourself' : phase.name;
  const phaseIcon = showPrepare ? '🎯' : phase.icon;
  const phaseDayLabel = showPrepare ? 'Before Day 1' : `Day ${dayNumber} of 90`;

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Phase Banner */}
        <View style={[styles.phaseBanner, { backgroundColor: showPrepare ? colors.primary : phase.color }]}>
          <Text style={styles.phaseBannerEmoji}>{phaseIcon}</Text>
          <View>
            <Text style={styles.phaseBannerDay}>{phaseDayLabel}</Text>
            <Text style={styles.phaseBannerName}>{phaseName}</Text>
          </View>
          {!showPrepare && (
            <View style={styles.phasePill}>
              <Text style={styles.phasePillText}>Week {weekNum}</Text>
            </View>
          )}
        </View>

        {/* How to think about your transition */}
        <TransitionThinking />

        {/* Framework intro */}
        <FrameworkIntro />

        {/* Key Topics Accordion */}
        <Text style={styles.sectionHeader}>Key Topics</Text>

        {CATEGORIES.map((cat) => {
          const articles = ARTICLES.filter((a) => a.category === cat.key);
          const isExpanded = expandedCategories.has(cat.key);

          return (
            <View key={cat.key} style={styles.accordionBlock}>
              <Pressable
                style={styles.accordionHeader}
                onPress={() => toggleCategory(cat.key)}
              >
                <Text style={styles.accordionTitle}>{cat.label}</Text>
                <Text style={styles.accordionChevron}>{isExpanded ? '▲' : '▼'}</Text>
              </Pressable>

              {isExpanded && (
                <View style={styles.accordionContent}>
                  {articles.map((article) => {
                    const isArticleExpanded = expandedArticles.has(article.id);
                    return (
                      <View key={article.id} style={styles.articleBlock}>
                        <Pressable
                          style={styles.articleHeader}
                          onPress={() => toggleArticle(article.id)}
                        >
                          <View style={styles.articleHeaderLeft}>
                            <Text style={styles.articleTitle}>{article.title}</Text>
                            <View style={styles.readTimeBadge}>
                              <Text style={styles.readTimeText}>{article.readTimeMinutes} min</Text>
                            </View>
                          </View>
                          <Text style={styles.articleChevron}>
                            {isArticleExpanded ? '▲' : '▼'}
                          </Text>
                        </Pressable>

                        {isArticleExpanded && (
                          <View style={styles.articleExpanded}>
                            {article.summaryBullets.map((bullet, i) => (
                              <View key={i} style={styles.bulletRow}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.articleBulletText}>{bullet}</Text>
                              </View>
                            ))}
                            <Pressable
                              style={styles.readFullBtn}
                              onPress={() =>
                                router.push(`/(tabs)/learn/article/${article.id}`)
                              }
                            >
                              <Text style={styles.readFullBtnText}>Read full article →</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* 90-Day Framework Card */}
        <Text style={styles.sectionHeader}>The Framework</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📖 The 90-Day Framework</Text>
          <Text style={styles.cardBody}>
            Michael Watkins' research across hundreds of leadership transitions identifies three
            distinct phases in a successful first 90 days:
          </Text>
          {(['learn', 'build', 'deliver'] as const).map((pk) => {
            const p = phaseConfig[pk];
            return (
              <View key={pk} style={[styles.phaseRow, { borderLeftColor: p.color }]}>
                <Text style={styles.phaseRowTitle}>
                  {p.icon} {p.name} ({p.days} days)
                </Text>
                <Text style={styles.phaseRowDesc}>{p.description}</Text>
              </View>
            );
          })}
          <Text style={[styles.cardBody, { marginTop: spacing.md }]}>
            The STARS model helps you diagnose what type of situation you've stepped into —
            Start-up, Turnaround, Accelerated Growth, Realignment, or Sustaining Success — and
            adapt your approach accordingly.
          </Text>
        </View>

        {/* About This App */}
        <Text style={styles.sectionHeader}>About Waypoint</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧭 What is Waypoint?</Text>
          <Text style={styles.cardBody}>
            Waypoint is a structured leadership transition companion, built on evidence from the
            world's leading researchers in how leaders succeed (and fail) in new roles.
          </Text>
          <Text style={styles.cardBody}>
            It is not a generic to-do app. Every framework, article, and checklist item is grounded
            in peer-reviewed research and practitioner experience.
          </Text>
          <Text style={styles.sourceHeader}>Research sources</Text>
          {[
            'Michael Watkins — The First 90 Days (Harvard Business School Press)',
            'Harvard Business Review — Leadership Transitions research programme',
            'McKinsey & Company — executive transition research',
            'Behavioural Insights Team — applied behavioural science in leadership',
          ].map((source, i) => (
            <Text key={i} style={styles.sourceItem}>
              • {source}
            </Text>
          ))}
          <Text style={styles.versionText}>Waypoint v2.0</Text>
        </View>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },

  phaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  phaseBannerEmoji: { fontSize: 28 },
  phaseBannerDay: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: typography.weights.medium,
  },
  phaseBannerName: {
    fontSize: typography.sizes.lg,
    color: '#fff',
    fontWeight: typography.weights.bold,
  },
  phasePill: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  phasePillText: { fontSize: typography.sizes.xs, color: '#fff', fontWeight: '600' },

  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  cardBody: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },

  bulletRow: { flexDirection: 'row', marginBottom: spacing.xs, alignItems: 'flex-start' },
  bulletDot: { color: colors.accent, fontWeight: 'bold', marginRight: spacing.sm, marginTop: 1 },
  bulletText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },

  sectionHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },

  accordionBlock: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  accordionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    flex: 1,
  },
  accordionChevron: { color: colors.text.muted, fontSize: typography.sizes.xs },
  accordionContent: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  articleBlock: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  articleHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  articleTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  readTimeBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  readTimeText: { fontSize: typography.sizes.xs, color: colors.accent, fontWeight: '600' },
  articleChevron: { color: colors.text.muted, fontSize: typography.sizes.xs, marginLeft: spacing.sm },
  articleExpanded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  articleBulletText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  readFullBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  readFullBtnText: {
    fontSize: typography.sizes.xs,
    color: '#fff',
    fontWeight: typography.weights.semibold,
  },

  phaseRow: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  phaseRowTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  phaseRowDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },

  sourceHeader: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sourceItem: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'right',
  },
});
