import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import {
  getCriteriaWithScores,
  hasAssessmentCriteria,
  seedDefaultCriteria,
  saveScore,
  updateCriterion,
  addCriterion,
  deleteCriterion,
  resetToDefaults,
  type CriterionWithScore,
} from '../db/assessmentRepo';

interface Props {
  personId: string;
  personName: string;
}

export default function AssessmentSection({ personId, personName }: Props) {
  const [criteria, setCriteria] = useState<CriterionWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editWeights, setEditWeights] = useState<Record<string, number>>({});
  const [editThresholds, setEditThresholds] = useState<Record<string, number>>({});
  const [editNames, setEditNames] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState('10');
  const [newCriterionThreshold, setNewCriterionThreshold] = useState('5');

  const loadData = useCallback(async () => {
    try {
      const hasCriteria = await hasAssessmentCriteria(personId);
      if (!hasCriteria) {
        await seedDefaultCriteria(personId);
      }
      const data = await getCriteriaWithScores(personId);
      setCriteria(data);
    } catch (e) {
      console.error('Load assessment error:', e);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const totalWeight = criteria.reduce((sum, c) => sum + c.max_weight, 0);
  const belowThreshold = criteria.filter((c) => c.score < c.min_threshold);

  const handleScoreChange = async (criterion: CriterionWithScore, delta: number) => {
    const newScore = Math.max(0, Math.min(criterion.max_weight, criterion.score + delta));
    if (newScore === criterion.score) return;
    try {
      await saveScore(personId, criterion.id, newScore, criterion.score_notes);
      setCriteria((prev) =>
        prev.map((c) => (c.id === criterion.id ? { ...c, score: newScore } : c))
      );
    } catch (e) {
      console.error('Save score error:', e);
    }
  };

  const handleNotesChange = async (criterion: CriterionWithScore, notes: string) => {
    try {
      await saveScore(personId, criterion.id, criterion.score, notes);
      setCriteria((prev) =>
        prev.map((c) => (c.id === criterion.id ? { ...c, score_notes: notes } : c))
      );
    } catch (e) {
      console.error('Save notes error:', e);
    }
  };

  const toggleNotes = (criterionId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(criterionId)) next.delete(criterionId);
      else next.add(criterionId);
      return next;
    });
  };

  const enterEditMode = () => {
    const weights: Record<string, number> = {};
    const thresholds: Record<string, number> = {};
    const names: Record<string, string> = {};
    for (const c of criteria) {
      weights[c.id] = c.max_weight;
      thresholds[c.id] = c.min_threshold;
      names[c.id] = c.name;
    }
    setEditWeights(weights);
    setEditThresholds(thresholds);
    setEditNames(names);
    setEditMode(true);
  };

  const editWeightTotal = Object.values(editWeights).reduce((s, w) => s + w, 0);

  const handleSaveEdits = async () => {
    if (editWeightTotal !== 100) {
      Alert.alert('Weights must total 100', `Current total: ${editWeightTotal}`);
      return;
    }
    try {
      for (const c of criteria) {
        await updateCriterion(c.id, {
          name: editNames[c.id],
          max_weight: editWeights[c.id],
          min_threshold: editThresholds[c.id],
        });
      }
      setEditMode(false);
      await loadData();
    } catch (e) {
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const handleAddCriterion = async () => {
    const name = newCriterionName.trim();
    if (!name) return;
    const weight = parseInt(newCriterionWeight) || 10;
    const threshold = parseInt(newCriterionThreshold) || 5;
    try {
      await addCriterion(personId, name, weight, threshold, criteria.length);
      setShowAddModal(false);
      setNewCriterionName('');
      setNewCriterionWeight('10');
      setNewCriterionThreshold('5');
      await loadData();
    } catch (e) {
      Alert.alert('Error', 'Could not add criterion.');
    }
  };

  const handleDeleteCriterion = (id: string, name: string) => {
    Alert.alert(
      'Delete criterion',
      `Remove "${name}" from the assessment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCriterion(id);
              await loadData();
              // Also remove from edit state if in edit mode
              if (editMode) {
                setEditWeights((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                });
                setEditThresholds((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                });
                setEditNames((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                });
              }
            } catch (e) {
              Alert.alert('Error', 'Could not delete criterion.');
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to defaults',
      'This will remove all customisations and reset to the default 6 Watkins criteria. Scores will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults(personId);
              setEditMode(false);
              await loadData();
            } catch (e) {
              Alert.alert('Error', 'Could not reset.');
            }
          },
        },
      ]
    );
  };

  const getThresholdColor = (score: number, threshold: number, maxWeight: number) => {
    if (score >= threshold) return colors.success;
    if (score >= threshold * 0.7) return colors.warning;
    return colors.error;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading assessment…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TEAM ASSESSMENT</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLarge}>{totalScore}</Text>
            <Text style={styles.scoreMax}>/ {totalWeight}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: totalWeight > 0 ? `${(totalScore / totalWeight) * 100}%` : '0%',
                  backgroundColor: belowThreshold.length === 0 ? colors.success : colors.warning,
                },
              ]}
            />
          </View>
          {belowThreshold.length > 0 && (
            <Text style={styles.belowThresholdText}>
              ⚠️ {belowThreshold.length} {belowThreshold.length === 1 ? 'criterion' : 'criteria'} below threshold
            </Text>
          )}
          {belowThreshold.length === 0 && totalScore > 0 && (
            <Text style={styles.allPassText}>✓ All criteria meeting threshold</Text>
          )}
        </View>

        {/* Action bar */}
        <View style={styles.actionBar}>
          {!editMode ? (
            <>
              <Pressable style={styles.actionBtn} onPress={enterEditMode}>
                <Text style={styles.actionBtnText}>✏️ Edit criteria</Text>
              </Pressable>
              {criteria.length < 10 && (
                <Pressable style={styles.actionBtn} onPress={() => setShowAddModal(true)}>
                  <Text style={styles.actionBtnText}>+ Add</Text>
                </Pressable>
              )}
              <Pressable style={styles.actionBtnDanger} onPress={handleReset}>
                <Text style={styles.actionBtnDangerText}>Reset</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.weightTotalPill}>
                <Text style={[
                  styles.weightTotalText,
                  editWeightTotal !== 100 && styles.weightTotalTextError,
                ]}>
                  Total: {editWeightTotal} / 100
                </Text>
              </View>
              <Pressable style={styles.cancelEditBtn} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelEditText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveEditBtn, editWeightTotal !== 100 && { opacity: 0.4 }]}
                onPress={handleSaveEdits}
                disabled={editWeightTotal !== 100}
              >
                <Text style={styles.saveEditText}>Save</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Criteria list */}
        {criteria.map((criterion) => {
          const thresholdColor = getThresholdColor(criterion.score, criterion.min_threshold, criterion.max_weight);
          const notesExpanded = expandedNotes.has(criterion.id);

          if (editMode) {
            return (
              <View key={criterion.id} style={styles.editCard}>
                <View style={styles.editCardHeader}>
                  <TextInput
                    style={styles.editNameInput}
                    value={editNames[criterion.id] ?? criterion.name}
                    onChangeText={(t) => setEditNames((p) => ({ ...p, [criterion.id]: t }))}
                  />
                  <Pressable onPress={() => handleDeleteCriterion(criterion.id, criterion.name)}>
                    <Text style={styles.editDeleteText}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.editRow}>
                  <View style={styles.editField}>
                    <Text style={styles.editFieldLabel}>Weight</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => setEditWeights((p) => ({ ...p, [criterion.id]: Math.max(1, (p[criterion.id] ?? criterion.max_weight) - 1) }))}
                      >
                        <Text style={styles.stepperText}>−</Text>
                      </Pressable>
                      <Text style={styles.stepperValue}>{editWeights[criterion.id] ?? criterion.max_weight}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => setEditWeights((p) => ({ ...p, [criterion.id]: Math.min(50, (p[criterion.id] ?? criterion.max_weight) + 1) }))}
                      >
                        <Text style={styles.stepperText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.editField}>
                    <Text style={styles.editFieldLabel}>Threshold</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => setEditThresholds((p) => ({ ...p, [criterion.id]: Math.max(0, (p[criterion.id] ?? criterion.min_threshold) - 1) }))}
                      >
                        <Text style={styles.stepperText}>−</Text>
                      </Pressable>
                      <Text style={styles.stepperValue}>{editThresholds[criterion.id] ?? criterion.min_threshold}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => setEditThresholds((p) => ({ ...p, [criterion.id]: Math.min(editWeights[criterion.id] ?? criterion.max_weight, (p[criterion.id] ?? criterion.min_threshold) + 1) }))}
                      >
                        <Text style={styles.stepperText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          }

          return (
            <View key={criterion.id} style={styles.criterionCard}>
              <View style={styles.criterionHeader}>
                <View style={[styles.thresholdDot, { backgroundColor: thresholdColor }]} />
                <View style={styles.criterionInfo}>
                  <Text style={styles.criterionName}>{criterion.name}</Text>
                  {criterion.description && (
                    <Text style={styles.criterionDesc} numberOfLines={1}>
                      {criterion.description}
                    </Text>
                  )}
                </View>
                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreValue}>{criterion.score}</Text>
                  <Text style={styles.scoreSlash}>/</Text>
                  <Text style={styles.scoreWeight}>{criterion.max_weight}</Text>
                </View>
              </View>

              {/* Score stepper */}
              <View style={styles.scoreStepper}>
                <Pressable
                  style={styles.stepperBtnLarge}
                  onPress={() => handleScoreChange(criterion, -1)}
                >
                  <Text style={styles.stepperTextLarge}>−</Text>
                </Pressable>
                <View style={styles.scoreBarContainer}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        width: criterion.max_weight > 0 ? `${(criterion.score / criterion.max_weight) * 100}%` : '0%',
                        backgroundColor: thresholdColor,
                      },
                    ]}
                  />
                  {criterion.min_threshold > 0 && (
                    <View
                      style={[
                        styles.thresholdMarker,
                        { left: `${(criterion.min_threshold / criterion.max_weight) * 100}%` },
                      ]}
                    />
                  )}
                </View>
                <Pressable
                  style={styles.stepperBtnLarge}
                  onPress={() => handleScoreChange(criterion, 1)}
                >
                  <Text style={styles.stepperTextLarge}>+</Text>
                </Pressable>
              </View>

              {/* Threshold indicator */}
              <View style={styles.thresholdRow}>
                <Text style={[styles.thresholdLabel, { color: thresholdColor }]}>
                  {criterion.score >= criterion.min_threshold ? '✓' : '⚠️'} Threshold: {criterion.min_threshold}
                </Text>
                <Pressable onPress={() => toggleNotes(criterion.id)}>
                  <Text style={styles.notesToggle}>
                    {notesExpanded ? 'Hide notes' : 'Notes'}
                  </Text>
                </Pressable>
              </View>

              {/* Notes */}
              {notesExpanded && (
                <TextInput
                  style={styles.criterionNotesInput}
                  value={criterion.score_notes ?? ''}
                  onChangeText={(text) => handleNotesChange(criterion, text)}
                  placeholder="Add qualitative notes..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={3}
                />
              )}
            </View>
          );
        })}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Add criterion modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Criterion</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newCriterionName}
              onChangeText={setNewCriterionName}
              placeholder="e.g. Communication"
              placeholderTextColor={colors.text.muted}
              autoFocus
            />

            <View style={styles.modalRow}>
              <View style={styles.modalField}>
                <Text style={styles.fieldLabel}>Weight (max points)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCriterionWeight}
                  onChangeText={setNewCriterionWeight}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.fieldLabel}>Min threshold</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCriterionThreshold}
                  onChangeText={setNewCriterionThreshold}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.modalHint}>
              Note: total weights across all criteria should sum to 100. You may need to adjust existing weights after adding.
            </Text>

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveBtn, !newCriterionName.trim() && { opacity: 0.5 }]}
                onPress={handleAddCriterion}
                disabled={!newCriterionName.trim()}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['2xl'],
  },
  loadingText: { color: colors.text.muted },

  // Summary
  summaryCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  scoreLarge: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  scoreMax: {
    fontSize: typography.sizes.xl,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radii.full,
  },
  belowThresholdText: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  allPassText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: '600',
  },

  // Actions
  actionBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actionBtnDanger: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  actionBtnDangerText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '600',
  },
  weightTotalPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightTotalText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.success,
  },
  weightTotalTextError: {
    color: colors.error,
  },
  cancelEditBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelEditText: { fontSize: typography.sizes.sm, color: colors.text.secondary },
  saveEditBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  saveEditText: { fontSize: typography.sizes.sm, color: '#fff', fontWeight: '600' },

  // Criterion card (scoring mode)
  criterionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  criterionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  thresholdDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  criterionInfo: { flex: 1 },
  criterionName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  criterionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  scoreSlash: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginHorizontal: 2,
  },
  scoreWeight: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },

  scoreStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  stepperBtnLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTextLarge: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'visible',
    position: 'relative',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  thresholdMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: colors.text.muted,
    borderRadius: 1,
  },

  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thresholdLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  notesToggle: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
    fontWeight: '600',
  },
  criterionNotesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    minHeight: 50,
    backgroundColor: colors.background,
    marginTop: spacing.sm,
  },

  // Edit mode cards
  editCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.xl,
    padding: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  editCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  editNameInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 2,
  },
  editDeleteText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  editField: {
    flex: 1,
  },
  editFieldLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    minWidth: 30,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalField: { flex: 1 },
  modalHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: { color: colors.text.secondary, fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalSaveText: { color: '#fff', fontWeight: typography.weights.bold },
});
