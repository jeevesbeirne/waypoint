import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../lib/theme';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🧭</Text>
          <Text style={styles.logoText}>Waypoint</Text>
          <Text style={styles.tagline}>Your first 90 days, structured</Text>
        </View>

        <View style={styles.pillars}>
          {[
            { emoji: '📚', text: 'Research-backed frameworks' },
            { emoji: '✅', text: 'Personalised action plan' },
            { emoji: '👤', text: 'Stakeholder tracking' },
            { emoji: '💭', text: 'Daily reflection prompts' },
          ].map((item, i) => (
            <View key={i} style={styles.pillarRow}>
              <Text style={styles.pillarEmoji}>{item.emoji}</Text>
              <Text style={styles.pillarText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.push('/onboarding/welcome')}
        >
          <Text style={styles.buttonText}>Begin your journey →</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Based on research from Watkins, Harvard Business School & McKinsey
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  logoText: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.accent,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: typography.sizes.lg,
    color: colors.text.inverse,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  pillars: {
    width: '100%',
    marginBottom: spacing['2xl'],
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pillarEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
  },
  pillarText: {
    fontSize: typography.sizes.base,
    color: colors.text.inverse,
    opacity: 0.85,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 50,
    marginBottom: spacing.lg,
  },
  buttonText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  footnote: {
    fontSize: typography.sizes.xs,
    color: colors.text.inverse,
    opacity: 0.4,
    textAlign: 'center',
  },
});
