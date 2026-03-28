import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { getDiagnosticNotes, saveDiagnosticNote, deleteDiagnosticNote, type DiagnosticNote } from '../../../../db/diagnosticsRepo';
import { formatDate } from '../../../../lib/utils';

const QUADRANTS = [
  { key: 'swot_strength', title: 'Strengths', emoji: '💪', color: '#16A34A' },
  { key: 'swot_weakness', title: 'Weaknesses', emoji: '⚠️', color: '#DC2626' },
  { key: 'swot_opportunity', title: 'Opportunities', emoji: '🌟', color: '#2563EB' },
  { key: 'swot_threat', title: 'Threats', emoji: '🔥', color: '#D97706' },
] as const;

export default function SwotScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, DiagnosticNote[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(QUADRANTS.map((q) => q.key)));
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  const loadNotes = useCallback(async () => {
    const result: Record<string, DiagnosticNote[]> = {};
    for (const q of QUADRANTS) {
      result[q.key] = await getDiagnosticNotes(q.key);
    }
    setNotes(result);
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleAdd = async (type: string) => {
    if (!newContent.trim()) return;
    await saveDiagnosticNote({ type, content: newContent.trim(), source: newSource.trim() || undefined });
    setNewContent('');
    setNewSource('');
    setAddingTo(null);
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
          <Text style={styles.heading}>SWOT Analysis</Text>
          <View style={{ width: 80 }} />
        </View>

        {QUADRANTS.map((q) => {
          const items = notes[q.key] ?? [];
          const isExpanded = expanded.has(q.key);
          return (
            <View key={q.key} style={[styles.quadrant, { borderLeftColor: q.color }]}>
              <Pressable style={styles.quadrantHeader} onPress={() => setExpanded((prev) => {
                const next = new Set(prev);
                if (next.has(q.key)) next.delete(q.key); else next.add(q.key);
                return next;
              })}>
                <Text style={styles.quadrantTitle}>{q.emoji} {q.title} ({items.length})</Text>
                <Text style={styles.quadrantChevron}>{isExpanded ? '▼' : '▶'}</Text>
              </Pressable>
              {isExpanded && (
                <View style={styles.quadrantBody}>
                  {items.map((note) => (
                    <Pressable key={note.id} style={styles.noteItem} onLongPress={() => handleDelete(note.id)}>
                      <Text style={styles.noteContent}>{note.content}</Text>
                      <View style={styles.noteMeta}>
                        {note.source ? <Text style={styles.noteSource}>{note.source}</Text> : null}
                        <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                      </View>
                    </Pressable>
                  ))}
                  {addingTo === q.key ? (
                    <View style={styles.addForm}>
                      <TextInput style={styles.addInput} value={newContent} onChangeText={setNewContent} placeholder="Add observation..." placeholderTextColor={colors.text.muted} multiline autoFocus />
                      <TextInput style={[styles.addInput, { marginTop: spacing.xs }]} value={newSource} onChangeText={setNewSource} placeholder="Source (optional)" placeholderTextColor={colors.text.muted} />
                      <View style={styles.addBtns}>
                        <Pressable onPress={() => { setAddingTo(null); setNewContent(''); setNewSource(''); }}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveBtn} onPress={() => handleAdd(q.key)}>
                          <Text style={styles.saveBtnText}>Add</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable style={styles.addNoteBtn} onPress={() => { setAddingTo(q.key); setNewContent(''); setNewSource(''); }}>
                      <Text style={styles.addNoteBtnText}>+ Add to {q.title}</Text>
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
  quadrant: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.md,
    borderRadius: radii.lg, borderLeftWidth: 4, overflow: 'hidden', ...shadows.sm,
  },
  quadrantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  quadrantTitle: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.primary },
  quadrantChevron: { color: colors.text.muted },
  quadrantBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
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
