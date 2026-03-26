import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { saveLog, getLogForDate } from '../db/logsRepo';
import { toggleChecklistItem, getChecklistItems } from '../db/checklistRepo';
import { getTodayString } from '../lib/utils';

type SheetState = 'closed' | 'open' | 'log-thought' | 'tick-off';

/**
 * Returns true if the FAB should be visible on the current route.
 * Show only on the 4 main index tab screens.
 */
function useFABVisible(): boolean {
  const segments = useSegments() as string[];

  // segments looks like ['(tabs)', 'learn', 'index'] for the learn tab
  // We want to show ONLY on the top-level tab index screens.
  // Do NOT show on: article detail, add-person, checklist detail, settings, etc.
  if (!segments.includes('(tabs)')) return false;

  const tabIndex = segments.indexOf('(tabs)');
  const afterTab = segments.slice(tabIndex + 1);

  // Allowed paths: learn/index, checklist/index, my90days/index, reflect/index
  // (segments with only one segment after (tabs), or two where last is 'index')
  if (afterTab.length === 0) return false;

  const tab = afterTab[0];
  const allowedTabs = ['learn', 'checklist', 'people', 'reflect', 'record-reflect'];
  if (!allowedTabs.includes(tab)) return false;

  // If there are sub-segments (like article/[id], add-person, [id]) — hide
  if (afterTab.length > 1) {
    const sub = afterTab[1];
    // 'index' is the default screen name expo-router uses
    if (sub !== 'index') return false;
  }

  return true;
}

export default function QuickCaptureFAB() {
  const router = useRouter();
  const { checklistItems, setChecklistItems } = useAppStore();
  const [state, setState] = useState<SheetState>('closed');
  const [thought, setThought] = useState('');
  const [saving, setSaving] = useState(false);
  const [tickSearch, setTickSearch] = useState('');

  const fabVisible = useFABVisible();

  const incomplete = checklistItems
    .filter((i) => i.completed === 0)
    .filter((i) =>
      tickSearch === '' ||
      i.title.toLowerCase().includes(tickSearch.toLowerCase())
    );

  const handleSaveThought = async () => {
    if (!thought.trim()) return;
    setSaving(true);
    try {
      const today = getTodayString();
      const existing = await getLogForDate(today);
      const combined = existing?.response
        ? `${existing.response}\n\n[Quick note] ${thought.trim()}`
        : `[Quick note] ${thought.trim()}`;
      await saveLog({ date: today, response: combined });
      setThought('');
      setState('closed');
    } catch (e) {
      Alert.alert('Error', 'Could not save thought.');
    } finally {
      setSaving(false);
    }
  };

  const handleTick = async (id: string) => {
    try {
      await toggleChecklistItem(id, true);
      const updated = await getChecklistItems();
      setChecklistItems(updated);
      setState('closed');
    } catch (e) {
      Alert.alert('Error', 'Could not update checklist.');
    }
  };

  return (
    <>
      {/* FAB button — only visible on main tab screens */}
      {fabVisible && state === 'closed' && (
        <Pressable style={styles.fab} onPress={() => setState('open')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {/* Bottom sheet / modal */}
      <Modal
        visible={state !== 'closed'}
        animationType="slide"
        transparent
        onRequestClose={() => setState('closed')}
      >
        <Pressable style={styles.overlay} onPress={() => setState('closed')}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            {state === 'open' && (
              <>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Quick Capture</Text>

                <Pressable
                  style={styles.sheetOption}
                  onPress={() => setState('log-thought')}
                >
                  <Text style={styles.sheetOptionEmoji}>📝</Text>
                  <View style={styles.sheetOptionText}>
                    <Text style={styles.sheetOptionTitle}>Log a thought</Text>
                    <Text style={styles.sheetOptionDesc}>Quick note saved to today's Reflect entry</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.sheetOption}
                  onPress={() => {
                    setState('closed');
                    router.push('/(tabs)/people/add-person');
                  }}
                >
                  <Text style={styles.sheetOptionEmoji}>👤</Text>
                  <View style={styles.sheetOptionText}>
                    <Text style={styles.sheetOptionTitle}>Add a person</Text>
                    <Text style={styles.sheetOptionDesc}>Shortcut to My 90 Days</Text>
                  </View>
                </Pressable>

                <Pressable
                  style={styles.sheetOption}
                  onPress={() => setState('tick-off')}
                >
                  <Text style={styles.sheetOptionEmoji}>✅</Text>
                  <View style={styles.sheetOptionText}>
                    <Text style={styles.sheetOptionTitle}>Tick something off</Text>
                    <Text style={styles.sheetOptionDesc}>Mark a checklist item complete</Text>
                  </View>
                </Pressable>

                <Pressable style={styles.cancelBtn} onPress={() => setState('closed')}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}

            {state === 'log-thought' && (
              <>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Log a Thought</Text>
                <TextInput
                  style={styles.thoughtInput}
                  value={thought}
                  onChangeText={setThought}
                  placeholder="What's on your mind?"
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.thoughtBtns}>
                  <Pressable style={styles.cancelBtn} onPress={() => setState('open')}>
                    <Text style={styles.cancelText}>Back</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveThoughtBtn, (!thought.trim() || saving) && { opacity: 0.5 }]}
                    onPress={handleSaveThought}
                    disabled={!thought.trim() || saving}
                  >
                    <Text style={styles.saveThoughtBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
                  </Pressable>
                </View>
              </>
            )}

            {state === 'tick-off' && (
              <>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Tick Something Off</Text>
                <TextInput
                  style={styles.tickSearch}
                  value={tickSearch}
                  onChangeText={setTickSearch}
                  placeholder="Search checklist..."
                  placeholderTextColor={colors.text.muted}
                />
                <FlatList
                  data={incomplete.slice(0, 10)}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 300 }}
                  renderItem={({ item }) => (
                    <Pressable style={styles.tickItem} onPress={() => handleTick(item.id)}>
                      <Text style={styles.tickEmoji}>⬜</Text>
                      <Text style={styles.tickTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.tickEmpty}>No incomplete items found</Text>
                  }
                />
                <Pressable style={styles.cancelBtn} onPress={() => setState('open')}>
                  <Text style={styles.cancelText}>Back</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    zIndex: 999,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
  },

  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionEmoji: { fontSize: 24, marginRight: spacing.md },
  sheetOptionText: { flex: 1 },
  sheetOptionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  sheetOptionDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },

  cancelBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: { color: colors.text.secondary, fontSize: typography.sizes.base },

  thoughtInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    minHeight: 100,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  thoughtBtns: { flexDirection: 'row', gap: spacing.md },
  saveThoughtBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
  },
  saveThoughtBtnText: { color: '#fff', fontWeight: '600' },

  tickSearch: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  tickItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  tickEmoji: { fontSize: 18 },
  tickTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  tickEmpty: {
    textAlign: 'center',
    color: colors.text.muted,
    paddingVertical: spacing.xl,
  },
});
