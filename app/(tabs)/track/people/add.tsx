import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { savePerson } from '../../../../db/peopleRepo';
import { useAppStore } from '../../../../store';
import { getPeople } from '../../../../db/peopleRepo';
import { colors, typography, spacing, radii } from '../../../../lib/theme';

const CATEGORIES = [
  'Boss / Line Manager', 'Direct Report', 'Team Member', 'Peer',
  'Senior Stakeholder', 'Client / Customer', 'External Partner', 'Wider Stakeholder', 'Other',
];

export default function AddPersonScreen() {
  const router = useRouter();
  const { setPeople } = useAppStore();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [category, setCategory] = useState('Direct Report');
  const [notes, setNotes] = useState('');
  const [influence, setInfluence] = useState<'low' | 'medium' | 'high'>('medium');
  const [alignment, setAlignment] = useState<'resistant' | 'neutral' | 'supportive'>('neutral');
  const [isKey, setIsKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    setSaving(true);
    try {
      await savePerson({ name: name.trim(), title: title.trim(), organisation: organisation.trim(), category, notes: notes.trim(), influence, alignment, is_key_stakeholder: isKey ? 1 : 0 });
      setPeople(await getPeople());
      router.back();
    } catch (e) { Alert.alert('Error', 'Could not save person.'); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></Pressable>
          <Text style={styles.heading}>Add Person</Text>
          <Pressable onPress={handleSave} disabled={saving}><Text style={[styles.save, saving && { opacity: 0.5 }]}>{saving ? 'Saving…' : 'Save'}</Text></Pressable>
        </View>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.text.muted} />

        <Text style={styles.label}>Title / Role</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Head of Marketing" placeholderTextColor={colors.text.muted} />

        <Text style={styles.label}>Organisation</Text>
        <TextInput style={styles.input} value={organisation} onChangeText={setOrganisation} placeholder="Company or team" placeholderTextColor={colors.text.muted} />

        <Text style={styles.label}>Relationship Type</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} style={[styles.chip, category === c && styles.chipOn]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Influence</Text>
        <View style={styles.chipRow}>
          {(['low', 'medium', 'high'] as const).map((v) => (
            <Pressable key={v} style={[styles.chip, influence === v && styles.chipOn]} onPress={() => setInfluence(v)}>
              <Text style={[styles.chipText, influence === v && styles.chipTextOn]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Alignment</Text>
        <View style={styles.chipRow}>
          {(['resistant', 'neutral', 'supportive'] as const).map((v) => (
            <Pressable key={v} style={[styles.chip, alignment === v && styles.chipOn]} onPress={() => setAlignment(v)}>
              <Text style={[styles.chipText, alignment === v && styles.chipTextOn]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.keyToggle} onPress={() => setIsKey(!isKey)}>
          <Text style={styles.keyToggleText}>{isKey ? '⭐ Key Stakeholder' : '☆ Mark as Key Stakeholder'}</Text>
        </Pressable>

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, { minHeight: 100 }]} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" placeholder="Any notes about this person..." placeholderTextColor={colors.text.muted} />

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>Save Person</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  cancel: { color: colors.text.secondary, fontSize: typography.sizes.base },
  heading: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.primary },
  save: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: '600' },
  label: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.sizes.base, color: colors.text.primary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.xs, color: colors.text.secondary },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  keyToggle: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.accentLight },
  keyToggleText: { color: colors.accent, fontWeight: '600', fontSize: typography.sizes.sm },
  saveBtn: { backgroundColor: colors.accent, paddingVertical: spacing.md, borderRadius: radii.full, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: '#fff', fontSize: typography.sizes.lg, fontWeight: '700' },
});
