import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import {
  getVisionMission, saveVisionMission,
  getStrategies, saveStrategy, deleteStrategy,
  getAlignmentScores, saveAlignmentScore,
  type Strategy, type AlignmentScore, type StrategyVision,
} from '../../../../db/strategyRepo';

const ALIGNMENT_DIMS = [
  { key: 'structure' as const, title: 'Structure', desc: 'How well does your org structure support your strategy?' },
  { key: 'processes' as const, title: 'Processes', desc: 'Are key processes aligned with strategic priorities?' },
  { key: 'capabilities' as const, title: 'Capabilities', desc: 'Does the team have the skills and resources needed?' },
] as const;

const ALIGNMENT_COLORS = ['#DC2626', '#D97706', '#D97706', '#16A34A', '#16A34A'];
const ALIGNMENT_LABELS = ['Misaligned', 'Weak', 'Partial', 'Good', 'Fully Aligned'];
const STATUS_OPTIONS: Strategy['status'][] = ['draft', 'in_progress', 'aligned'];
const STATUS_LABELS: Record<string, string> = { draft: 'Draft', in_progress: 'In Progress', aligned: 'Aligned' };

export default function StrategyHome() {
  const router = useRouter();
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [alignment, setAlignment] = useState<AlignmentScore[]>([]);
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const v = await getVisionMission('vision');
    const m = await getVisionMission('mission');
    setVision(v?.content ?? '');
    setMission(m?.content ?? '');
    setStrategies(await getStrategies());
    setAlignment(await getAlignmentScores());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveVM = async (type: 'vision' | 'mission', content: string) => {
    await saveVisionMission(type, content);
  };

  const handleAddStrategy = async () => {
    if (!newTitle.trim()) return;
    await saveStrategy({ title: newTitle.trim(), description: newDesc.trim() });
    setNewTitle(''); setNewDesc(''); setShowAddStrategy(false);
    await loadData();
  };

  const handleDeleteStrategy = (s: Strategy) => {
    Alert.alert('Delete strategy?', s.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStrategy(s.id); await loadData(); } },
    ]);
  };

  const handleStatusChange = async (s: Strategy) => {
    const idx = STATUS_OPTIONS.indexOf(s.status);
    const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    await saveStrategy({ ...s, status: next });
    await loadData();
  };

  const getAlignmentScore = (dim: string): number => {
    return alignment.find((a) => a.dimension === dim)?.score ?? 3;
  };

  const handleAlignmentChange = async (dim: AlignmentScore['dimension'], delta: number) => {
    const current = getAlignmentScore(dim);
    const next = Math.max(1, Math.min(5, current + delta));
    await saveAlignmentScore(dim, next);
    setAlignment(await getAlignmentScores());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Track</Text></Pressable>
          <Text style={styles.heading}>Strategy & Alignment</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Vision */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔭 Vision</Text>
          <TextInput
            style={styles.textArea}
            value={vision}
            onChangeText={setVision}
            onBlur={() => saveVM('vision', vision)}
            placeholder="What does success look like?"
            placeholderTextColor={colors.text.muted}
            multiline
          />
        </View>

        {/* Mission */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Mission</Text>
          <TextInput
            style={styles.textArea}
            value={mission}
            onChangeText={setMission}
            onBlur={() => saveVM('mission', mission)}
            placeholder="What is your team's purpose?"
            placeholderTextColor={colors.text.muted}
            multiline
          />
        </View>

        {/* Strategies */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Strategies</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowAddStrategy(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
        {strategies.length === 0 ? (
          <Text style={styles.emptyText}>No strategies defined yet. Add your first strategy above.</Text>
        ) : strategies.map((s) => (
          <Pressable key={s.id} style={styles.strategyCard} onLongPress={() => handleDeleteStrategy(s)}>
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyTitle}>{s.title}</Text>
              <Pressable onPress={() => handleStatusChange(s)}>
                <View style={[styles.statusBadge, s.status === 'aligned' ? { backgroundColor: colors.success + '22' } : s.status === 'in_progress' ? { backgroundColor: colors.warning + '22' } : {}]}>
                  <Text style={[styles.statusText, s.status === 'aligned' ? { color: colors.success } : s.status === 'in_progress' ? { color: colors.warning } : {}]}>{STATUS_LABELS[s.status]}</Text>
                </View>
              </Pressable>
            </View>
            {s.description ? <Text style={styles.strategyDesc}>{s.description}</Text> : null}
          </Pressable>
        ))}

        {/* Alignment */}
        <Text style={[styles.sectionTitle, { marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm }]}>⚖️ Alignment Assessment</Text>
        {ALIGNMENT_DIMS.map((dim) => {
          const score = getAlignmentScore(dim.key);
          const colorIdx = score - 1;
          return (
            <View key={dim.key} style={styles.alignCard}>
              <Text style={styles.alignTitle}>{dim.title}</Text>
              <Text style={styles.alignDesc}>{dim.desc}</Text>
              <View style={styles.alignRow}>
                <Pressable style={styles.stepBtn} onPress={() => handleAlignmentChange(dim.key, -1)}>
                  <Text style={styles.stepBtnText}>−</Text>
                </Pressable>
                <View style={[styles.alignScore, { backgroundColor: ALIGNMENT_COLORS[colorIdx] + '22', borderColor: ALIGNMENT_COLORS[colorIdx] }]}>
                  <Text style={[styles.alignScoreText, { color: ALIGNMENT_COLORS[colorIdx] }]}>{score}/5 — {ALIGNMENT_LABELS[colorIdx]}</Text>
                </View>
                <Pressable style={styles.stepBtn} onPress={() => handleAlignmentChange(dim.key, 1)}>
                  <Text style={styles.stepBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* Early Wins */}
        <Pressable style={styles.earlyWinsBtn} onPress={() => router.push('/(tabs)/track/strategy/early-wins' as any)}>
          <Text style={styles.earlyWinsEmoji}>🏆</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.earlyWinsTitle}>Early Wins</Text>
            <Text style={styles.earlyWinsDesc}>Track and manage your early win opportunities</Text>
          </View>
          <Text style={{ fontSize: 22, color: colors.text.muted }}>›</Text>
        </Pressable>

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      <Modal visible={showAddStrategy} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Add Strategy</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Strategy name" placeholderTextColor={colors.text.muted} autoFocus />
            <TextInput style={[styles.input, { marginTop: spacing.sm, minHeight: 80 }]} value={newDesc} onChangeText={setNewDesc} placeholder="Description (optional)" placeholderTextColor={colors.text.muted} multiline />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancelBtn} onPress={() => { setShowAddStrategy(false); setNewTitle(''); setNewDesc(''); }}>
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveBtn} onPress={handleAddStrategy}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  card: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  textArea: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, fontSize: typography.sizes.sm, color: colors.text.primary, minHeight: 80 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
  addBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  addBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
  emptyText: { marginHorizontal: spacing.lg, color: colors.text.muted, fontSize: typography.sizes.sm },
  strategyCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  strategyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strategyTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, backgroundColor: colors.border },
  statusText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.text.muted },
  strategyDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.xs },
  alignCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  alignTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary },
  alignDesc: { fontSize: typography.sizes.xs, color: colors.text.muted, marginBottom: spacing.sm },
  alignRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { backgroundColor: colors.border, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text.primary },
  alignScore: { flex: 1, paddingVertical: 8, borderRadius: radii.md, alignItems: 'center', borderWidth: 1 },
  alignScoreText: { fontWeight: '700', fontSize: typography.sizes.sm },
  earlyWinsBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    marginHorizontal: spacing.md, marginTop: spacing.lg, borderRadius: radii.xl, padding: spacing.lg, ...shadows.md,
  },
  earlyWinsEmoji: { fontSize: 32, marginRight: spacing.md },
  earlyWinsTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
  earlyWinsDesc: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalInner: { padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalCancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  modalSaveBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, backgroundColor: colors.accent, alignItems: 'center' },
});
