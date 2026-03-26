import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { savePerson } from '../../../db/peopleRepo';
import { useAppStore } from '../../../store';
import { getPeople } from '../../../db/peopleRepo';
import { colors, typography, spacing, radii } from '../../../lib/theme';

const CATEGORIES = [
  'Boss / Line Manager',
  'Direct Report',
  'Team Member',
  'Peer',
  'Senior Stakeholder',
  'Client / Customer',
  'External Partner',
  'Wider Stakeholder',
  'Other',
];

export default function AddPersonScreen() {
  const router = useRouter();
  const setPeople = useAppStore((s) => s.setPeople);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [isKey, setIsKey] = useState(false);
  const [relationshipQuality, setRelationshipQuality] = useState(3);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this person.');
      return;
    }
    setSaving(true);
    try {
      await savePerson({
        name: name.trim(),
        title: title.trim(),
        organisation: organisation.trim(),
        category,
        notes: notes.trim(),
        influence: 'medium',
        alignment: 'neutral',
        is_key_stakeholder: isKey ? 1 : 0,
        relationship_quality: relationshipQuality,
      });
      const updated = await getPeople();
      setPeople(updated);
      router.back();
    } catch (e) {
      console.error('Save person error:', e);
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Cancel</Text>
          </Pressable>
          <Text style={styles.heading}>Add Person</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sarah Johnson"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title / Role</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Head of Finance"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Organisation</Text>
          <TextInput
            style={styles.input}
            value={organisation}
            onChangeText={setOrganisation}
            placeholder="e.g. Acme Corp (for external contacts)"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryOption, category === cat && styles.categoryOptionSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Anything relevant about this person — background, priorities, relationship history..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Relationship quality</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRelationshipQuality(star)}>
                <Text style={{ fontSize: 28, opacity: star <= relationshipQuality ? 1 : 0.25 }}>⭐</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.keyToggle}
          onPress={() => setIsKey((v) => !v)}
        >
          <Text style={styles.keyToggleText}>
            {isKey ? '⭐' : '☆'} Mark as key stakeholder
          </Text>
        </Pressable>

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Add Person'}</Text>
        </Pressable>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
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
    paddingVertical: spacing.md,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.base },
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  saveText: { color: colors.accent, fontSize: typography.sizes.base, fontWeight: '600' },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
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
  textArea: { minHeight: 80, paddingTop: spacing.sm },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  categoryOptionTextSelected: { color: '#fff', fontWeight: '600' },
  keyToggle: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  keyToggleText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
