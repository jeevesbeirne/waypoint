import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import {
  getVisionMission,
  saveVisionMission,
  getStrategies,
  saveStrategy,
  deleteStrategy,
  getStrategyAlignments,
  saveStrategyAlignment,
  type Strategy,
  type StrategyAlignment,
  type StrategyVision,
} from '../../../../db/strategyRepo';

const ALIGNMENT_DIMS = [
  { key: 'structure' as const, title: '🏗 Structure', desc: 'Current team structure relevant to this strategy and how to review it' },
  { key: 'processes' as const, title: '⚙️ Processes', desc: 'Relevant processes to support this strategy and how they need changing' },
  { key: 'capabilities' as const, title: '🧠 Capabilities', desc: 'Capabilities in the team and how they need to change' },
] as const;

const ALIGNMENT_COLORS = ['#DC2626', '#D97706', '#D97706', '#16A34A', '#16A34A'];
const ALIGNMENT_LABELS = ['Misaligned', 'Weak', 'Partial', 'Good', 'Fully Aligned'];
const STATUS_OPTIONS: Strategy['status'][] = ['draft', 'in_progress', 'aligned'];
const STATUS_LABELS: Record<Strategy['status'], string> = { draft: 'Draft', in_progress: 'In Progress', aligned: 'Aligned' };

function buildDefaultAlignment(strategyId: string, dimension: StrategyAlignment['dimension']): StrategyAlignment {
  return {
    id: `${strategyId}-${dimension}`,
    strategy_id: strategyId,
    dimension,
    score: 3,
    current_state: null,
    changes_needed: null,
    updated_at: null,
  };
}

function mergeAlignments(strategyId: string, alignments: StrategyAlignment[]): StrategyAlignment[] {
  return ALIGNMENT_DIMS.map((dim) => {
    const existing = alignments.find((item) => item.dimension === dim.key);
    return existing ?? buildDefaultAlignment(strategyId, dim.key);
  });
}

export default function StrategyHome() {
  const router = useRouter();
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyAlignments, setStrategyAlignments] = useState<Map<string, StrategyAlignment[]>>(new Map());
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);
  const [showAddStrategy, setShowAddStrategy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const loadAlignments = useCallback(async (strategyId: string) => {
    const alignments = mergeAlignments(strategyId, await getStrategyAlignments(strategyId));
    setStrategyAlignments((prev) => {
      const next = new Map(prev);
      next.set(strategyId, alignments);
      return next;
    });
    return alignments;
  }, []);

  const loadData = useCallback(async () => {
    const [visionRow, missionRow, strategyRows] = await Promise.all([
      getVisionMission('vision'),
      getVisionMission('mission'),
      getStrategies(),
    ]);
    setVision((visionRow as StrategyVision | null)?.content ?? '');
    setMission((missionRow as StrategyVision | null)?.content ?? '');
    setStrategies(strategyRows);

    const entries = await Promise.all(
      strategyRows.map(async (strategy) => [strategy.id, mergeAlignments(strategy.id, await getStrategyAlignments(strategy.id))] as const)
    );
    setStrategyAlignments(new Map(entries));
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveVM = async (type: 'vision' | 'mission', content: string) => {
    await saveVisionMission(type, content);
  };

  const handleAddStrategy = async () => {
    if (!newTitle.trim()) return;
    const created = await saveStrategy({ title: newTitle.trim(), description: newDesc.trim() || null });
    setNewTitle('');
    setNewDesc('');
    setShowAddStrategy(false);
    setStrategies((prev) => [created, ...prev]);
    await loadAlignments(created.id);
    setExpandedStrategyId(created.id);
  };

  const handleDeleteStrategy = (strategy: Strategy) => {
    Alert.alert('Delete strategy?', strategy.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteStrategy(strategy.id);
          setStrategies((prev) => prev.filter((item) => item.id !== strategy.id));
          setStrategyAlignments((prev) => {
            const next = new Map(prev);
            next.delete(strategy.id);
            return next;
          });
          if (expandedStrategyId === strategy.id) setExpandedStrategyId(null);
        },
      },
    ]);
  };

  const handleToggleExpand = async (strategy: Strategy) => {
    if (expandedStrategyId === strategy.id) {
      setExpandedStrategyId(null);
      return;
    }
    setExpandedStrategyId(strategy.id);
    if (!strategyAlignments.has(strategy.id)) {
      await loadAlignments(strategy.id);
    }
  };

  const handleStatusChange = async (strategy: Strategy) => {
    const idx = STATUS_OPTIONS.indexOf(strategy.status);
    const nextStatus = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    const updated = await saveStrategy({ ...strategy, status: nextStatus, title: strategy.title });
    setStrategies((prev) => prev.map((item) => (item.id === strategy.id ? updated : item)));
  };

  const handleStrategyDescriptionChange = (strategyId: string, description: string) => {
    setStrategies((prev) => prev.map((item) => (item.id === strategyId ? { ...item, description } : item)));
  };

  const handleStrategyDescriptionBlur = async (strategy: Strategy) => {
    const updated = await saveStrategy({
      ...strategy,
      title: strategy.title,
      description: strategy.description ?? null,
    });
    setStrategies((prev) => prev.map((item) => (item.id === strategy.id ? updated : item)));
  };

  const getAlignmentFor = (strategyId: string, dimension: StrategyAlignment['dimension']): StrategyAlignment => {
    const items = strategyAlignments.get(strategyId) ?? [];
    return items.find((item) => item.dimension === dimension) ?? buildDefaultAlignment(strategyId, dimension);
  };

  const setAlignmentDraft = (strategyId: string, dimension: StrategyAlignment['dimension'], updates: Partial<StrategyAlignment>) => {
    setStrategyAlignments((prev) => {
      const next = new Map(prev);
      const current = mergeAlignments(strategyId, next.get(strategyId) ?? []);
      next.set(
        strategyId,
        current.map((item) => (item.dimension === dimension ? { ...item, ...updates } : item))
      );
      return next;
    });
  };

  const persistAlignment = async (
    strategyId: string,
    dimension: StrategyAlignment['dimension'],
    override?: Partial<StrategyAlignment>
  ) => {
    const current = { ...getAlignmentFor(strategyId, dimension), ...override };
    const saved = await saveStrategyAlignment(
      strategyId,
      dimension,
      current.score,
      current.current_state ?? undefined,
      current.changes_needed ?? undefined
    );
    setStrategyAlignments((prev) => {
      const next = new Map(prev);
      const items = mergeAlignments(strategyId, next.get(strategyId) ?? []);
      next.set(
        strategyId,
        items.map((item) => (item.dimension === dimension ? saved : item))
      );
      return next;
    });
  };

  const handleAlignmentScoreChange = async (
    strategyId: string,
    dimension: StrategyAlignment['dimension'],
    delta: number
  ) => {
    const current = getAlignmentFor(strategyId, dimension);
    const nextScore = Math.max(1, Math.min(5, current.score + delta));
    setAlignmentDraft(strategyId, dimension, { score: nextScore });
    await persistAlignment(strategyId, dimension, { score: nextScore });
  };

  const handleAlignmentTextChange = (
    strategyId: string,
    dimension: StrategyAlignment['dimension'],
    field: 'current_state' | 'changes_needed',
    value: string
  ) => {
    setAlignmentDraft(strategyId, dimension, { [field]: value });
  };

  const handleAlignmentBlur = async (strategyId: string, dimension: StrategyAlignment['dimension']) => {
    await persistAlignment(strategyId, dimension);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Track</Text></Pressable>
          <Text style={styles.heading}>Strategy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔭 Vision</Text>
          <TextInput
            style={styles.textArea}
            value={vision}
            onChangeText={setVision}
            onBlur={() => void saveVM('vision', vision)}
            placeholder="What does success look like?"
            placeholderTextColor={colors.text.muted}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Mission</Text>
          <TextInput
            style={styles.textArea}
            value={mission}
            onChangeText={setMission}
            onBlur={() => void saveVM('mission', mission)}
            placeholder="What is your team's purpose?"
            placeholderTextColor={colors.text.muted}
            multiline
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Strategies</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowAddStrategy(true)}>
            <Text style={styles.addBtnText}>+ Add Strategy</Text>
          </Pressable>
        </View>

        {strategies.length === 0 ? (
          <Text style={styles.emptyText}>No strategies defined yet. Add your first strategy above.</Text>
        ) : (
          strategies.map((strategy) => {
            const isExpanded = expandedStrategyId === strategy.id;
            return (
              <View key={strategy.id} style={styles.strategyCard}>
                <Pressable style={styles.strategyHeader} onPress={() => void handleToggleExpand(strategy)} onLongPress={() => handleDeleteStrategy(strategy)}>
                  <View style={styles.strategyHeaderLeft}>
                    <View style={styles.expandBtn}>
                      <Text style={styles.expandArrow}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                    <View style={styles.strategyHeaderText}>
                      <Text style={styles.strategyTitle}>{strategy.title}</Text>
                      <Text style={styles.strategySubtitle}>{isExpanded ? 'Tap to collapse' : 'Tap to expand'}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => void handleStatusChange(strategy)}>
                    <View style={[
                      styles.statusBadge,
                      strategy.status === 'aligned'
                        ? { backgroundColor: colors.success + '22' }
                        : strategy.status === 'in_progress'
                          ? { backgroundColor: colors.warning + '22' }
                          : undefined,
                    ]}>
                      <Text style={[
                        styles.statusText,
                        strategy.status === 'aligned'
                          ? { color: colors.success }
                          : strategy.status === 'in_progress'
                            ? { color: colors.warning }
                            : undefined,
                      ]}>
                        {STATUS_LABELS[strategy.status]}
                      </Text>
                    </View>
                  </Pressable>
                </Pressable>

                {isExpanded && (
                  <View style={styles.strategyExpanded}>
                    <Text style={styles.subsectionTitle}>Overview</Text>
                    <TextInput
                      style={styles.textArea}
                      value={strategy.description ?? ''}
                      onChangeText={(value) => handleStrategyDescriptionChange(strategy.id, value)}
                      onBlur={() => void handleStrategyDescriptionBlur(strategy)}
                      placeholder="Describe this strategy and what it should achieve"
                      placeholderTextColor={colors.text.muted}
                      multiline
                    />

                    {ALIGNMENT_DIMS.map((dim) => {
                      const alignment = getAlignmentFor(strategy.id, dim.key);
                      const colorIdx = Math.max(0, Math.min(4, alignment.score - 1));
                      const scoreColor = ALIGNMENT_COLORS[colorIdx];
                      return (
                        <View key={dim.key} style={styles.alignCard}>
                          <Text style={styles.alignTitle}>{dim.title}</Text>
                          <Text style={styles.alignDesc}>{dim.desc}</Text>
                          <View style={styles.alignRow}>
                            <Pressable style={styles.stepBtn} onPress={() => void handleAlignmentScoreChange(strategy.id, dim.key, -1)}>
                              <Text style={styles.stepBtnText}>−</Text>
                            </Pressable>
                            <View style={[styles.alignScore, { backgroundColor: scoreColor + '22', borderColor: scoreColor }]}>
                              <Text style={[styles.alignScoreText, { color: scoreColor }]}>
                                {alignment.score}/5 - {ALIGNMENT_LABELS[colorIdx]}
                              </Text>
                            </View>
                            <Pressable style={styles.stepBtn} onPress={() => void handleAlignmentScoreChange(strategy.id, dim.key, 1)}>
                              <Text style={styles.stepBtnText}>+</Text>
                            </Pressable>
                          </View>

                          <Text style={styles.fieldLabel}>Current state</Text>
                          <TextInput
                            style={styles.alignTextArea}
                            value={alignment.current_state ?? ''}
                            onChangeText={(value) => handleAlignmentTextChange(strategy.id, dim.key, 'current_state', value)}
                            onBlur={() => void handleAlignmentBlur(strategy.id, dim.key)}
                            placeholder="What is true today?"
                            placeholderTextColor={colors.text.muted}
                            multiline
                          />

                          <Text style={styles.fieldLabel}>Changes needed</Text>
                          <TextInput
                            style={styles.alignTextArea}
                            value={alignment.changes_needed ?? ''}
                            onChangeText={(value) => handleAlignmentTextChange(strategy.id, dim.key, 'changes_needed', value)}
                            onBlur={() => void handleAlignmentBlur(strategy.id, dim.key)}
                            placeholder="What needs to change?"
                            placeholderTextColor={colors.text.muted}
                            multiline
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      <Modal visible={showAddStrategy} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Add Strategy</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Strategy name"
              placeholderTextColor={colors.text.muted}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.modalTextArea]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text.muted}
              multiline
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancelBtn} onPress={() => { setShowAddStrategy(false); setNewTitle(''); setNewDesc(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveBtn} onPress={() => void handleAddStrategy()}>
                <Text style={styles.modalSaveText}>Add</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  headerSpacer: { width: 56 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  addBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
  emptyText: { marginHorizontal: spacing.lg, color: colors.text.muted, fontSize: typography.sizes.sm },
  strategyCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  strategyHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: spacing.sm },
  expandBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  expandArrow: { fontSize: 18, color: colors.text.secondary, fontWeight: 'bold' },
  strategyHeaderText: { flex: 1 },
  strategyTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary },
  strategySubtitle: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, backgroundColor: colors.border },
  statusText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.text.muted },
  strategyExpanded: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  subsectionTitle: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.primary },
  alignCard: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alignTitle: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.primary },
  alignDesc: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: spacing.xs, marginBottom: spacing.sm },
  alignRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  stepBtn: {
    backgroundColor: colors.border,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text.primary },
  alignScore: { flex: 1, paddingVertical: 8, borderRadius: radii.md, alignItems: 'center', borderWidth: 1 },
  alignScoreText: { fontWeight: '700', fontSize: typography.sizes.sm },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  alignTextArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalInner: { padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg },
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
  modalTextArea: { marginTop: spacing.sm, minHeight: 88, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalCancelText: { color: colors.text.secondary, fontWeight: '600' },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
