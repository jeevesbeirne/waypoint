import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, Switch } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../lib/theme';
import { getEarlyWins, saveEarlyWin, deleteEarlyWin, type EarlyWin } from '../../../db/strategyRepo';

const STATUS_ORDER: EarlyWin['status'][] = ['identified', 'pitched', 'in_progress', 'delivered', 'communicated'];
const STATUS_LABELS: Record<string, string> = { identified: 'Identified', pitched: 'Pitched', in_progress: 'In Progress', delivered: 'Delivered', communicated: 'Communicated' };
const STATUS_COLORS: Record<string, string> = { identified: '#6B7280', pitched: '#2563EB', in_progress: '#D97706', delivered: '#16A34A', communicated: '#059669' };

export default function EarlyWinsScreen() {
  const router = useRouter();
  const [wins, setWins] = useState<EarlyWin[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTeamOwned, setIsTeamOwned] = useState(false);
  const [addressesFrustration, setAddressesFrustration] = useState(false);
  const [connectedToStrategy, setConnectedToStrategy] = useState(false);

  const loadData = useCallback(async () => {
    setWins(await getEarlyWins());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    await saveEarlyWin({
      title: title.trim(), description: desc.trim(),
      is_visible: isVisible ? 1 : 0, is_team_owned: isTeamOwned ? 1 : 0,
      addresses_frustration: addressesFrustration ? 1 : 0, connected_to_strategy: connectedToStrategy ? 1 : 0,
    });
    setTitle(''); setDesc(''); setIsVisible(false); setIsTeamOwned(false); setAddressesFrustration(false); setConnectedToStrategy(false);
    setShowAdd(false);
    await loadData();
  };

  const handleStatusAdvance = async (win: EarlyWin) => {
    const idx = STATUS_ORDER.indexOf(win.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    await saveEarlyWin({ ...win, status: next, date_delivered: next === 'delivered' ? new Date().toISOString().split('T')[0] : win.date_delivered });
    await loadData();
  };

  const handleDelete = (win: EarlyWin) => {
    Alert.alert('Delete early win?', win.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEarlyWin(win.id); await loadData(); } },
    ]);
  };

  const criteria = (win: EarlyWin) => {
    const checks = [
      { label: 'Visible', val: win.is_visible },
      { label: 'Team-owned', val: win.is_team_owned },
      { label: 'Addresses frustration', val: win.addresses_frustration },
      { label: 'Connected to strategy', val: win.connected_to_strategy },
    ];
    return checks;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/(tabs)/track' as any)}><Text style={styles.backText}>← Track</Text></Pressable>
          <Text style={styles.heading}>Early Wins</Text>
          <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}><Text style={styles.addBtnText}>+ Add</Text></Pressable>
        </View>

        {wins.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyTitle}>No early wins yet</Text>
            <Text style={styles.emptyDesc}>Identify 2-3 early wins that build credibility and momentum.</Text>
          </View>
        ) : wins.map((win) => {
          const statusColor = STATUS_COLORS[win.status] ?? colors.text.muted;
          return (
            <Pressable key={win.id} style={styles.winCard} onLongPress={() => handleDelete(win)}>
              <View style={styles.winHeader}>
                <Text style={styles.winTitle}>{win.title}</Text>
                <Pressable onPress={() => handleStatusAdvance(win)}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[win.status]}</Text>
                  </View>
                </Pressable>
              </View>
              {win.description ? <Text style={styles.winDesc}>{win.description}</Text> : null}
              <View style={styles.criteriaRow}>
                {criteria(win).map((c) => (
                  <View key={c.label} style={[styles.critBadge, c.val === 1 && styles.critBadgeOn]}>
                    <Text style={[styles.critText, c.val === 1 && styles.critTextOn]}>{c.val === 1 ? '✓' : '✗'} {c.label}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.modalTitle}>Add Early Win</Text>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="What's the early win?" placeholderTextColor={colors.text.muted} autoFocus />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { minHeight: 80 }]} value={desc} onChangeText={setDesc} placeholder="Details..." placeholderTextColor={colors.text.muted} multiline />

            <Text style={[styles.label, { marginTop: spacing.lg }]}>Watkins Criteria</Text>
            {[
              { label: 'Visible to the organisation?', val: isVisible, set: setIsVisible },
              { label: 'Team-owned (not just you)?', val: isTeamOwned, set: setIsTeamOwned },
              { label: 'Addresses a longstanding frustration?', val: addressesFrustration, set: setAddressesFrustration },
              { label: 'Connected to strategic narrative?', val: connectedToStrategy, set: setConnectedToStrategy },
            ].map((item) => (
              <View key={item.label} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Switch value={item.val} onValueChange={item.set} trackColor={{ true: colors.accent }} />
              </View>
            ))}

            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => { setShowAdd(false); setTitle(''); setDesc(''); }}>
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveModalBtn} onPress={handleAdd}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add Win</Text>
              </Pressable>
            </View>
          </ScrollView>
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
  addBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  addBtnText: { color: '#fff', fontSize: typography.sizes.sm, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  emptyDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'center', paddingHorizontal: spacing.xl },
  winCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  winHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  winTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, borderWidth: 1 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: '600' },
  winDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.sm },
  criteriaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  critBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm, backgroundColor: colors.border },
  critBadgeOn: { backgroundColor: colors.success + '22' },
  critText: { fontSize: typography.sizes.xs, color: colors.text.muted },
  critTextOn: { color: colors.success, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  switchLabel: { fontSize: typography.sizes.sm, color: colors.text.primary, flex: 1 },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  saveModalBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.full, backgroundColor: colors.accent, alignItems: 'center' },
});
