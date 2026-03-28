import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { getDiagnosticNotes, saveDiagnosticNote, deleteDiagnosticNote, type DiagnosticNote } from '../../../../db/diagnosticsRepo';
import { formatDate } from '../../../../lib/utils';

const FORCES = [
  { key: 'porter_rivalry', title: 'Competitive Rivalry', emoji: '⚔️', desc: 'How intense is competition in your market?' },
  { key: 'porter_new_entrants', title: 'Threat of New Entrants', emoji: '🚪', desc: 'How easy is it for new competitors to enter?' },
  { key: 'porter_substitutes', title: 'Threat of Substitutes', emoji: '🔄', desc: 'Can customers switch to alternatives easily?' },
  { key: 'porter_suppliers', title: 'Supplier Power', emoji: '📦', desc: 'How much negotiating power do suppliers have?' },
  { key: 'porter_buyers', title: 'Buyer Power', emoji: '🛒', desc: 'How much negotiating power do buyers have?' },
] as const;

export default function PorterScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, DiagnosticNote[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(FORCES.map((f) => f.key)));
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  const loadNotes = useCallback(async () => {
    const result: Record<string, DiagnosticNote[]> = {};
    for (const f of FORCES) {
      result[f.key] = await getDiagnosticNotes(f.key);
    }
    setNotes(result);
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleAdd = async (type: string) => {
    if (!newContent.trim()) return;
    await saveDiagnosticNote({ type, content: newContent.trim(), source: newSource.trim() || undefined });
    setNewContent(''); setNewSource(''); setAddingTo(null);
    await loadNotes();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete note?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDiagnosticNote(id); await loadNotes(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.backText}>← Diagnostics</Text></Pressable>
          <Text style={styles.heading}>Five Forces</Text>
          <View style={{ width: 80 }} />
        </View>

        {FORCES.map((force) => {
          const items = notes[force.key] ?? [];
          const isExpanded = expanded.has(force.key);
          return (
            <View key={force.key} style={styles.section}>
              <Pressable style={styles.sectionHeader} onPress={() => setExpanded((prev) => {
                const next = new Set(prev);
                if (next.has(force.key)) next.delete(force.key); else next.add(force.key);
                return next;
              })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{force.emoji} {force.title} ({items.length})</Text>
                  <Text style={styles.sectionDesc}>{force.desc}</Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
              </Pressable>
              {isExpanded && (
                <View style={styles.sectionBody}>
                  {items.map((note) => (
                    <Pressable key={note.id} style={styles.noteItem} onLongPress={() => handleDelete(note.id)}>
                      <Text style={styles.noteContent}>{note.content}</Text>
                      <View style={styles.noteMeta}>
                        {note.source ? <Text style={styles.noteSource}>{note.source}</Text> : null}
                        <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                      </View>
                    </Pressable>
                  ))}
                  {addingTo === force.key ? (
                    <View style={styles.addForm}>
                      <TextInput style={styles.addInput} value={newContent} onChangeText={setNewContent} placeholder="Add observation..." placeholderTextColor={colors.text.muted} multiline autoFocus />
                      <TextInput style={[styles.addInput, { marginTop: spacing.xs }]} value={newSource} onChangeText={setNewSource} placeholder="Source (optional)" placeholderTextColor={colors.text.muted} />
                      <View style={styles.addBtns}>
                        <Pressable onPress={() => { setAddingTo(null); setNewContent(''); setNewSource(''); }}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveBtn} onPress={() => handleAdd(force.key)}>
                          <Text style={styles.saveBtnText}>Add</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable style={styles.addNoteBtn} onPress={() => { setAddingTo(force.key); setNewContent(''); setNewSource(''); }}>
                      <Text style={styles.addNoteBtnText}>+ Add observation</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  heading: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary },
  section: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radii.lg, overflow: 'hidden', ...shadows.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
  sectionDesc: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: 2 },
  chevron: { color: colors.text.muted, marginLeft: spacing.sm },
  sectionBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  noteItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  noteContent: { fontSize: typography.sizes.sm, color: colors.text.primary, lineHeight: 20 },
  noteMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  noteSource: { fontSize: typography.sizes.xs, color: colors.accent, fontStyle: 'italic' },
  noteDate: { fontSize: typography.sizes.xs, color: colors.text.muted },
  addForm: { marginTop: spacing.sm },
  addInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.sm, color: colors.text.primary },
  addBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.sm },
  cancelText: { color: colors.text.muted, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: typography.sizes.sm },
  addNoteBtn: { marginTop: spacing.sm },
  addNoteBtnText: { color: colors.accent, fontWeight: '600', fontSize: typography.sizes.sm },
});
