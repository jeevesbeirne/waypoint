import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii, shadows } from '../../../../lib/theme';
import { getDiagnosticNotes, saveDiagnosticNote, deleteDiagnosticNote, type DiagnosticNote } from '../../../../db/diagnosticsRepo';
import { formatDate } from '../../../../lib/utils';

export default function DiagnosticNotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<DiagnosticNote[]>([]);
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  const loadNotes = useCallback(async () => {
    setNotes(await getDiagnosticNotes('general'));
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    await saveDiagnosticNote({ type: 'general', content: newContent.trim(), source: newSource.trim() || undefined });
    setNewContent(''); setNewSource(''); setAdding(false);
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
          <Text style={styles.heading}>General Notes</Text>
          <Pressable onPress={() => setAdding(true)}><Text style={styles.addText}>+ Add</Text></Pressable>
        </View>

        {adding && (
          <View style={styles.addForm}>
            <TextInput style={styles.addInput} value={newContent} onChangeText={setNewContent} placeholder="Capture your observation..." placeholderTextColor={colors.text.muted} multiline autoFocus />
            <TextInput style={[styles.addInput, { marginTop: spacing.xs }]} value={newSource} onChangeText={setNewSource} placeholder="Source (optional)" placeholderTextColor={colors.text.muted} />
            <View style={styles.addBtns}>
              <Pressable onPress={() => { setAdding(false); setNewContent(''); setNewSource(''); }}>
                <Text style={{ color: colors.text.muted, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAdd}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        )}

        {notes.length === 0 && !adding ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptyDesc}>Capture diagnostic information that doesn't fit SWOT, Porter, or STARS.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => setAdding(true)}>
              <Text style={styles.emptyBtnText}>+ Add your first note</Text>
            </Pressable>
          </View>
        ) : (
          notes.map((note) => (
            <Pressable key={note.id} style={styles.noteCard} onLongPress={() => handleDelete(note.id)}>
              <Text style={styles.noteContent}>{note.content}</Text>
              <View style={styles.noteMeta}>
                {note.source ? <Text style={styles.noteSource}>{note.source}</Text> : null}
                <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
              </View>
            </Pressable>
          ))
        )}
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
  addText: { color: colors.accent, fontWeight: '600', fontSize: typography.sizes.sm },
  addForm: { marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  addInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.sm, color: colors.text.primary },
  addBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.sm },
  saveBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  emptyDesc: { fontSize: typography.sizes.sm, color: colors.text.secondary, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  emptyBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
  noteCard: { backgroundColor: colors.surface, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
  noteContent: { fontSize: typography.sizes.sm, color: colors.text.primary, lineHeight: 20 },
  noteMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  noteSource: { fontSize: typography.sizes.xs, color: colors.accent, fontStyle: 'italic' },
  noteDate: { fontSize: typography.sizes.xs, color: colors.text.muted },
});
