import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { colors, typography, spacing, radii, shadows } from '../lib/theme';
import { format } from 'date-fns';
import {
  CONVERSATION_TYPES,
  getConversationsForCategory,
  type ConversationTypeId,
} from '../lib/watkins-conversations';
import {
  getConversationNotes,
  getConversationNoteCounts,
  addConversationNote,
  deleteConversationNote,
  type ConversationNote,
} from '../db/conversationsRepo';

interface Props {
  personId: string;
  category: string;
}

export default function ConversationsSection({ personId, category }: Props) {
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [cardNotes, setCardNotes] = useState<Record<string, ConversationNote[]>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const conversations = getConversationsForCategory(category);

  const loadCounts = useCallback(async () => {
    try {
      const counts = await getConversationNoteCounts(personId);
      setNoteCounts(counts);
    } catch (e) {
      console.error('Load conversation counts error:', e);
    }
  }, [personId]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const loadNotesForCard = useCallback(async (conversationType: ConversationTypeId) => {
    try {
      const notes = await getConversationNotes(personId, conversationType);
      setCardNotes((prev) => ({ ...prev, [conversationType]: notes }));
    } catch (e) {
      console.error('Load notes error:', e);
    }
  }, [personId]);

  const toggleCard = (conversationType: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(conversationType)) {
        next.delete(conversationType);
      } else {
        next.add(conversationType);
        loadNotesForCard(conversationType as ConversationTypeId);
      }
      return next;
    });
  };

  const handleStartAddNote = (conversationType: string) => {
    const today = format(new Date(), 'd MMM yyyy');
    setAddingTo(conversationType);
    setNewNoteText(`[${today}] `);
  };

  const handleSaveNote = async () => {
    if (!addingTo || !newNoteText.trim()) return;
    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await addConversationNote(
        personId,
        addingTo as ConversationTypeId,
        newNoteText.trim(),
        today
      );
      setNewNoteText('');
      setAddingTo(null);
      await loadNotesForCard(addingTo as ConversationTypeId);
      await loadCounts();
    } catch (e) {
      console.error('Save note error:', e);
      Alert.alert('Error', 'Could not save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = (noteId: string, conversationType: string) => {
    Alert.alert(
      'Delete note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversationNote(noteId);
              await loadNotesForCard(conversationType as ConversationTypeId);
              await loadCounts();
            } catch (e) {
              Alert.alert('Error', 'Could not delete note.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>Key Conversations</Text>
        <Text style={styles.sectionDesc}>
          Structured conversations from Watkins' "The First 90 Days" — track your progress with each one.
        </Text>
      </View>

      {conversations.map((conv) => {
        const isExpanded = expandedCards.has(conv.id);
        const noteCount = noteCounts[conv.id] || 0;
        const notes = cardNotes[conv.id] || [];
        const isAdding = addingTo === conv.id;

        return (
          <View key={conv.id} style={styles.card}>
            <Pressable style={styles.cardHeader} onPress={() => toggleCard(conv.id)}>
              <View style={styles.cardNumberBadge}>
                <Text style={styles.cardNumberText}>{conv.number}</Text>
              </View>
              <View style={styles.cardHeaderContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{conv.title}</Text>
                  {noteCount > 0 && (
                    <View style={styles.noteCountBadge}>
                      <Text style={styles.noteCountText}>{noteCount}</Text>
                    </View>
                  )}
                </View>
                {!isExpanded && (
                  <Text style={styles.cardShortDesc} numberOfLines={2}>
                    {conv.shortDescription}
                  </Text>
                )}
              </View>
              <Text style={styles.cardChevron}>{isExpanded ? '▼' : '▶'}</Text>
            </Pressable>

            {isExpanded && (
              <View style={styles.cardBody}>
                <Text style={styles.cardFullDesc}>{conv.description}</Text>

                {/* Notes list */}
                {notes.length > 0 && (
                  <View style={styles.notesList}>
                    {notes.map((note) => (
                      <Pressable
                        key={note.id}
                        style={styles.noteItem}
                        onLongPress={() => handleDeleteNote(note.id, conv.id)}
                      >
                        <Text style={styles.noteBullet}>•</Text>
                        <Text style={styles.noteText}>{note.note_text}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {notes.length === 0 && !isAdding && (
                  <Text style={styles.noNotesText}>No notes yet — tap below to add your first.</Text>
                )}

                {/* Add note area */}
                {isAdding ? (
                  <View style={styles.addNoteArea}>
                    <TextInput
                      style={styles.addNoteInput}
                      value={newNoteText}
                      onChangeText={setNewNoteText}
                      placeholder="Type your note..."
                      placeholderTextColor={colors.text.muted}
                      multiline
                      autoFocus
                    />
                    <View style={styles.addNoteBtns}>
                      <Pressable
                        style={styles.cancelNoteBtn}
                        onPress={() => { setAddingTo(null); setNewNoteText(''); }}
                      >
                        <Text style={styles.cancelNoteText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.saveNoteBtn, saving && { opacity: 0.5 }]}
                        onPress={handleSaveNote}
                        disabled={saving || !newNoteText.trim()}
                      >
                        <Text style={styles.saveNoteText}>
                          {saving ? 'Saving…' : 'Save'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={styles.addNoteBtn}
                    onPress={() => handleStartAddNote(conv.id)}
                  >
                    <Text style={styles.addNoteBtnText}>+ Add note</Text>
                  </Pressable>
                )}

                {notes.length > 0 && (
                  <Text style={styles.deleteHint}>Long-press a note to delete</Text>
                )}
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },

  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },

  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  noteCountBadge: {
    backgroundColor: colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCountText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  cardShortDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  cardChevron: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },

  cardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  cardFullDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },

  notesList: {
    marginBottom: spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  noteBullet: {
    fontSize: typography.sizes.base,
    color: colors.accent,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  noteText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  noNotesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },

  addNoteArea: {
    marginTop: spacing.sm,
  },
  addNoteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    minHeight: 60,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  addNoteBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelNoteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelNoteText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  saveNoteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  saveNoteText: {
    fontSize: typography.sizes.sm,
    color: '#fff',
    fontWeight: '600',
  },

  addNoteBtn: {
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    backgroundColor: colors.accent + '08',
    alignItems: 'center',
  },
  addNoteBtnText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },

  deleteHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
