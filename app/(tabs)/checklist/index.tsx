import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../../store';
import {
  addCustomChecklistItem,
  getChecklistItems,
  moveChecklistItem,
  toggleChecklistItem,
  updateChecklistItemFields,
  type ChecklistItem,
} from '../../../db/checklistRepo';
import { colors, radii, spacing, typography } from '../../../lib/theme';
import { getWeekDateRange } from '../../../lib/utils';
import ItemDetailModal from '../../../components/ItemDetailModal';
import {
  WATKINS_GROUP_COLORS,
  WATKINS_GROUPS,
  WATKINS_SUB_ACTIVITIES,
  type WatkinsGroup,
} from '../../../lib/watkinsGroups';

type ViewMode = 'topic' | 'week';
type StatusFilter = 'all' | 'incomplete' | 'complete';
type PhaseFilter = 'all' | 'before' | 'learn' | 'build' | 'deliver';

const CATEGORIES = ['Boss', 'Team', 'Stakeholders', 'Self', 'Strategy'];
const WEEKS = Array.from({ length: 14 }, (_, i) => i);

function parseGroups(item: ChecklistItem): string[] {
  if (!item.watkins_groups) return [];
  try {
    const parsed = JSON.parse(item.watkins_groups);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function getPrimaryGroup(item: ChecklistItem): string {
  const groups = parseGroups(item);
  if (groups[0]) return groups[0];
  if (item.category === 'Boss') return 'Negotiate Success';
  if (item.category === 'Team') return 'Build Your Team';
  if (item.category === 'Stakeholders') return 'Create Alliances';
  if (item.category === 'Strategy') return 'Match Strategy to Situation';
  if (item.default_week === 0) return 'Prepare Yourself';
  return 'Manage Yourself';
}

function getGroupColor(item: ChecklistItem): string {
  const group = getPrimaryGroup(item);
  return (WATKINS_GROUP_COLORS as Record<string, string>)[group] ?? colors.accent;
}

function getStartWeek(item: ChecklistItem): number {
  return item.start_week ?? item.scheduled_week ?? item.default_week;
}

function getEndWeek(item: ChecklistItem): number {
  return item.end_week ?? getStartWeek(item);
}

function getDepth(item: ChecklistItem): number {
  return item.depth ?? 0;
}

function isInWeek(item: ChecklistItem, week: number): boolean {
  return week >= getStartWeek(item) && week <= getEndWeek(item);
}

export default function ChecklistTab() {
  const { checklistItems, setChecklistItems, settings } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('topic');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('incomplete');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addCategory, setAddCategory] = useState('Team');
  const [addStartWeek, setAddStartWeek] = useState(1);
  const [addEndWeek, setAddEndWeek] = useState(1);
  const [addGroups, setAddGroups] = useState<string[]>([]);
  const [addSubActivity, setAddSubActivity] = useState('');
  const [addParentId, setAddParentId] = useState<string | null>(null);

  const [moveItem, setMoveItem] = useState<ChecklistItem | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [draftStartWeek, setDraftStartWeek] = useState(1);
  const [draftEndWeek, setDraftEndWeek] = useState(1);

  const loadItems = useCallback(async () => {
    const items = await getChecklistItems();
    setChecklistItems(items);
  }, [setChecklistItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const applyFilters = useCallback((items: ChecklistItem[]): ChecklistItem[] => {
    return items.filter((item) => {
      if (statusFilter === 'incomplete' && item.completed === 1) return false;
      if (statusFilter === 'complete' && item.completed !== 1) return false;

      const startWeek = getStartWeek(item);
      if (phaseFilter === 'before' && startWeek !== 0) return false;
      if (phaseFilter === 'learn' && (startWeek === 0 || item.phase !== 1)) return false;
      if (phaseFilter === 'build' && item.phase !== 2) return false;
      if (phaseFilter === 'deliver' && item.phase !== 3) return false;

      if (categoryFilter !== 'all') {
        const groups = parseGroups(item);
        const primary = getPrimaryGroup(item);
        const allGroups = groups.length > 0 ? groups : [primary];
        if (!allGroups.includes(categoryFilter)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.title} ${item.description ?? ''} ${item.detail ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [categoryFilter, phaseFilter, searchQuery, statusFilter]);

  const filteredItems = useMemo(() => applyFilters(checklistItems), [applyFilters, checklistItems]);

  const parentItems = useMemo(() => filteredItems.filter((i) => !i.parent_id), [filteredItems]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of filteredItems) {
      if (!item.parent_id) continue;
      if (!map.has(item.parent_id)) map.set(item.parent_id, []);
      map.get(item.parent_id)?.push(item);
    }
    for (const [k, v] of map) {
      map.set(k, v.sort((a, b) => getStartWeek(a) - getStartWeek(b) || getDepth(a) - getDepth(b)));
    }
    return map;
  }, [filteredItems]);

  const rootParents = useMemo(() => parentItems.filter((i) => getDepth(i) === 0), [parentItems]);

  // Group filtered items by Watkins group for "By Topic" view
  const byWatkinsGroup = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const group of WATKINS_GROUPS) {
      map.set(group, []);
    }
    for (const item of filteredItems) {
      const groups = parseGroups(item);
      if (groups.length === 0) {
        const fallback = getPrimaryGroup(item);
        map.get(fallback)?.push(item);
      } else {
        for (const g of groups) {
          map.get(g)?.push(item);
        }
      }
    }
    // Sort items within each group by start_week
    for (const [k, v] of map) {
      map.set(k, v.sort((a, b) => getStartWeek(a) - getStartWeek(b)));
    }
    return map;
  }, [filteredItems]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(WATKINS_GROUPS as unknown as string[]));

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const byWeek = useMemo(() => {
    const map = new Map<number, ChecklistItem[]>();
    for (const week of WEEKS) {
      map.set(week, filteredItems.filter((item) => isInWeek(item, week)));
    }
    return map;
  }, [filteredItems]);

  const totalCount = checklistItems.length;
  const completeCount = checklistItems.filter((i) => i.completed === 1).length;
  const progressPct = totalCount ? (completeCount / totalCount) * 100 : 0;

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onRowPress = (item: ChecklistItem) => {
    setSelectedItem(item);
    setDetailVisible(true);
  };

  const moveWithChildrenPrompt = async (item: ChecklistItem, newStartWeek: number, newEndWeek: number) => {
    const oldStart = getStartWeek(item);
    const oldEnd = getEndWeek(item);
    const delta = newStartWeek - oldStart;
    const childItems = checklistItems.filter((candidate) => candidate.parent_id === item.id);

    const applyMove = async (includeChildren: boolean) => {
      await moveChecklistItem(item.id, newStartWeek, newEndWeek);
      if (includeChildren) {
        for (const child of childItems) {
          const cStart = Math.max(0, Math.min(13, getStartWeek(child) + delta));
          const cEnd = Math.max(cStart, Math.min(13, getEndWeek(child) + delta));
          await updateChecklistItemFields(child.id, {
            start_week: cStart,
            end_week: cEnd,
            scheduled_week: cStart,
          });
        }
      }
      if (oldStart !== oldEnd && oldEnd - oldStart !== newEndWeek - newStartWeek) {
        await updateChecklistItemFields(item.id, { end_week: newEndWeek });
      }
      await loadItems();
    };

    if (childItems.length === 0 || !item.parent_id) {
      await applyMove(false);
      return;
    }

    Alert.alert(
      'Move parent task',
      'This parent has child tasks. Move children too?',
      [
        { text: 'Parent only', onPress: () => void applyMove(false) },
        { text: 'Parent + children', onPress: () => void applyMove(true) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const onLongPress = (item: ChecklistItem) => {
    Alert.alert(item.title, 'Task options', [
      {
        text: 'Move to next week',
        onPress: async () => {
          const next = Math.min(13, getStartWeek(item) + 1);
          const duration = getEndWeek(item) - getStartWeek(item);
          await moveWithChildrenPrompt(item, next, Math.min(13, next + duration));
        },
      },
      {
        text: 'Move to specific week…',
        onPress: () => {
          setMoveItem(item);
          setShowMoveModal(true);
        },
      },
      {
        text: 'Edit dates…',
        onPress: () => {
          setMoveItem(item);
          setDraftStartWeek(getStartWeek(item));
          setDraftEndWeek(getEndWeek(item));
          setShowDateModal(true);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderWeekBadge = (item: ChecklistItem) => {
    const startWeek = getStartWeek(item);
    const endWeek = getEndWeek(item);
    return (
      <View style={styles.weekBadge}>
        <Text style={styles.weekBadgeText}>
          {startWeek === endWeek ? `Wk ${startWeek}` : `Wk ${startWeek}-${endWeek}`}
        </Text>
      </View>
    );
  };

  const renderItemRow = (item: ChecklistItem) => {
    const depth = getDepth(item);
    const isParent = (childrenByParent.get(item.id) ?? []).length > 0;
    const children = childrenByParent.get(item.id) ?? [];
    const childDone = children.filter((c) => c.completed === 1).length;

    return (
      <View key={item.id}>
        <View style={[styles.row, { marginLeft: depth * 16 + (depth >= 2 ? 16 : 0), borderLeftColor: getGroupColor(item) }]}>
          <Pressable style={styles.checkbox} onPress={() => void toggleChecklistItem(item.id, item.completed !== 1).then(loadItems)}>
            <Text style={styles.checkboxText}>{item.completed === 1 ? '✅' : '⬜'}</Text>
          </Pressable>
          <Pressable style={styles.rowContent} onPress={() => onRowPress(item)} onLongPress={() => onLongPress(item)}>
            <View style={styles.rowTitleLine}>
              {isParent ? (
                <Pressable onPress={() => toggleParent(item.id)} style={styles.chevronBtn}>
                  <Text style={styles.chevronText}>{expandedParents.has(item.id) ? '▼' : '▶'}</Text>
                </Pressable>
              ) : (
                <View style={styles.chevronPlaceholder} />
              )}
              <Text numberOfLines={2} style={[styles.rowTitle, item.completed === 1 && styles.rowTitleDone]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.rowMeta}>
              {renderWeekBadge(item)}
              {viewMode === 'week' && (
                <View style={[styles.watkinsChip, { backgroundColor: getGroupColor(item) + '22', borderColor: getGroupColor(item) }]}>
                  <Text style={[styles.watkinsChipText, { color: getGroupColor(item) }]}>{getPrimaryGroup(item)}</Text>
                </View>
              )}
              <Text style={styles.category}>{item.category}</Text>
              {isParent && <Text style={styles.progressBadge}>{childDone}/{children.length} sub-tasks complete</Text>}
            </View>
          </Pressable>
        </View>

        {isParent && expandedParents.has(item.id) && children.map((child) => renderItemRow(child))}
      </View>
    );
  };

  const toggleAddGroup = (group: string) => {
    setAddGroups((prev) => {
      if (prev.includes(group)) return prev.filter((g) => g !== group);
      if (prev.length >= 2) return prev;
      return [...prev, group];
    });
  };

  const addSubActivityOptions = addGroups.length > 0
    ? WATKINS_SUB_ACTIVITIES[addGroups[0] as WatkinsGroup] ?? []
    : [];

  const topLevelParents = checklistItems.filter((item) => (item.depth ?? 0) === 0);

  const handleAdd = async () => {
    if (!addTitle.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }
    const startWeek = addStartWeek;
    const endWeek = Math.max(addEndWeek, startWeek);
    await addCustomChecklistItem({
      title: addTitle.trim(),
      description: addDesc.trim(),
      category: addCategory,
      week: startWeek,
      start_week: startWeek,
      end_week: endWeek,
      parent_id: addParentId,
      depth: addParentId ? 1 : 0,
      watkins_groups: addGroups,
      sub_activity: addSubActivity || null,
    });
    setShowAddModal(false);
    setAddTitle('');
    setAddDesc('');
    setAddCategory('Team');
    setAddStartWeek(1);
    setAddEndWeek(1);
    setAddGroups([]);
    setAddSubActivity('');
    setAddParentId(null);
    await loadItems();
  };

  const hasStartDate = Boolean(settings?.start_date);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Checklist</Text>
            <Text style={styles.subHeading}>{completeCount} / {totalCount} complete</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Add Task</Text>
          </Pressable>
        </View>

        <View style={styles.progressWrap}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as `${number}%` }]} />
        </View>

        <TextInput
          style={styles.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
          placeholderTextColor={colors.text.muted}
        />

        <Pressable style={styles.filterToggle} onPress={() => setShowFilters((v) => !v)}>
          <Text style={styles.filterToggleText}>{showFilters ? '▲ Hide filters' : '▼ Filters'}</Text>
        </Pressable>

        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipRow}>
              {(['all', 'incomplete', 'complete'] as StatusFilter[]).map((v) => (
                <Pressable key={v} style={[styles.chip, statusFilter === v && styles.chipOn]} onPress={() => setStatusFilter(v)}>
                  <Text style={[styles.chipText, statusFilter === v && styles.chipTextOn]}>{v}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filterLabel}>Phase</Text>
            <View style={styles.chipRow}>
              {(['all', 'before', 'learn', 'build', 'deliver'] as PhaseFilter[]).map((v) => (
                <Pressable key={v} style={[styles.chip, phaseFilter === v && styles.chipOn]} onPress={() => setPhaseFilter(v)}>
                  <Text style={[styles.chipText, phaseFilter === v && styles.chipTextOn]}>{v}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filterLabel}>Watkins Group</Text>
            <View style={styles.chipRow}>
              {(['all', ...WATKINS_GROUPS] as string[]).map((v) => (
                <Pressable key={v} style={[styles.chip, categoryFilter === v && styles.chipOn]} onPress={() => setCategoryFilter(v)}>
                  <Text style={[styles.chipText, categoryFilter === v && styles.chipTextOn]}>{v === 'all' ? 'All' : v}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.viewToggle}>
          {(['topic', 'week'] as ViewMode[]).map((mode) => (
            <Pressable key={mode} style={[styles.toggle, viewMode === mode && styles.toggleOn]} onPress={() => setViewMode(mode)}>
              <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextOn]}>{mode === 'topic' ? 'By Topic' : 'By Week'}</Text>
            </Pressable>
          ))}
        </View>

        {viewMode === 'topic' && WATKINS_GROUPS.map((group) => {
          const items = byWatkinsGroup.get(group) ?? [];
          if (items.length === 0) return null;
          const groupColor = (WATKINS_GROUP_COLORS as Record<string, string>)[group] ?? colors.accent;
          const doneCount = items.filter((i) => i.completed === 1).length;
          return (
            <View key={`wg-${group}`} style={styles.topicSection}>
              <Pressable style={[styles.topicHeader, { borderLeftColor: groupColor }]} onPress={() => toggleGroup(group)}>
                <View style={styles.topicHeaderContent}>
                  <Text style={styles.topicHeaderText}>{expandedGroups.has(group) ? '▼' : '▶'}  {group}</Text>
                  <Text style={styles.topicCount}>{doneCount}/{items.length}</Text>
                </View>
              </Pressable>
              {expandedGroups.has(group) && items.map((item) => renderItemRow(item))}
            </View>
          );
        })}

        {viewMode === 'week' && WEEKS.map((week) => {
          const items = (byWeek.get(week) ?? []).filter((i) => (i.depth ?? 0) === 0);
          if (items.length === 0) return null;
          const date = hasStartDate && week > 0 && settings?.start_date ? getWeekDateRange(settings.start_date, week) : null;
          return (
            <View key={`wk-${week}`} style={styles.weekSection}>
              <Text style={styles.weekHeading}>{week === 0 ? 'Before You Start' : `Week ${week}`}</Text>
              {date && <Text style={styles.weekDates}>{date}</Text>}
              {items.map((item) => renderItemRow(item))}
            </View>
          );
        })}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      <ItemDetailModal
        item={selectedItem}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        allItems={checklistItems}
        startDate={settings?.start_date ?? null}
        onToggle={async (id, done) => {
          await toggleChecklistItem(id, done);
          await loadItems();
        }}
        onSave={async (id, updates) => {
          await updateChecklistItemFields(id, updates);
          await loadItems();
        }}
      />

      <Modal visible={showAddModal} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowAddModal(false)}><Text style={styles.modalBtn}>Cancel</Text></Pressable>
              <Text style={styles.modalTitle}>Add Task</Text>
              <Pressable onPress={() => void handleAdd()}><Text style={styles.modalBtn}>Save</Text></Pressable>
            </View>

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={addTitle} onChangeText={setAddTitle} />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={[styles.input, styles.inputArea]} value={addDesc} onChangeText={setAddDesc} multiline />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat} style={[styles.chip, addCategory === cat && styles.chipOn]} onPress={() => setAddCategory(cat)}>
                  <Text style={[styles.chipText, addCategory === cat && styles.chipTextOn]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Start Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {WEEKS.map((week) => (
                  <Pressable
                    key={`add-sw-${week}`}
                    style={[styles.chip, addStartWeek === week && styles.chipOn]}
                    onPress={() => {
                      const duration = addEndWeek - addStartWeek;
                      setAddStartWeek(week);
                      setAddEndWeek(Math.min(13, week + Math.max(0, duration)));
                    }}
                  >
                    <Text style={[styles.chipText, addStartWeek === week && styles.chipTextOn]}>Wk {week}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.inputLabel}>End Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {WEEKS.filter((w) => w >= addStartWeek).map((week) => (
                  <Pressable key={`add-ew-${week}`} style={[styles.chip, addEndWeek === week && styles.chipOn]} onPress={() => setAddEndWeek(week)}>
                    <Text style={[styles.chipText, addEndWeek === week && styles.chipTextOn]}>Wk {week}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.inputLabel}>Watkins Groups (max 2)</Text>
            <View style={styles.chipRow}>
              {WATKINS_GROUPS.map((group) => {
                const selected = addGroups.includes(group);
                return (
                  <Pressable key={group} style={[styles.chip, selected && styles.chipOn]} onPress={() => toggleAddGroup(group)}>
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{group}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Sub-Activity</Text>
            <View style={styles.chipRow}>
              {addSubActivityOptions.map((activity) => {
                const selected = addSubActivity === activity;
                return (
                  <Pressable key={activity} style={[styles.chip, selected && styles.chipOn]} onPress={() => setAddSubActivity(activity)}>
                    <Text style={[styles.chipText, selected && styles.chipTextOn]}>{activity}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Parent Task</Text>
            <View style={styles.chipRow}>
              <Pressable style={[styles.chip, addParentId === null && styles.chipOn]} onPress={() => setAddParentId(null)}>
                <Text style={[styles.chipText, addParentId === null && styles.chipTextOn]}>No parent</Text>
              </Pressable>
              {topLevelParents.map((parent) => (
                <Pressable
                  key={parent.id}
                  style={[styles.chip, addParentId === parent.id && styles.chipOn]}
                  onPress={() => setAddParentId(parent.id)}
                >
                  <Text style={[styles.chipText, addParentId === parent.id && styles.chipTextOn]}>{parent.title}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showMoveModal} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowMoveModal(false)}><Text style={styles.modalBtn}>Cancel</Text></Pressable>
              <Text style={styles.modalTitle}>Move Task</Text>
              <View />
            </View>
            <View style={styles.chipRow}>
              {WEEKS.map((week) => (
                <Pressable
                  key={`mv-${week}`}
                  style={styles.chip}
                  onPress={async () => {
                    if (!moveItem) return;
                    const duration = getEndWeek(moveItem) - getStartWeek(moveItem);
                    await moveWithChildrenPrompt(moveItem, week, Math.min(13, week + duration));
                    setShowMoveModal(false);
                    setMoveItem(null);
                  }}
                >
                  <Text style={styles.chipText}>Wk {week}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showDateModal} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowDateModal(false)}><Text style={styles.modalBtn}>Cancel</Text></Pressable>
              <Text style={styles.modalTitle}>Edit Dates</Text>
              <Pressable
                onPress={async () => {
                  if (!moveItem) return;
                  await moveWithChildrenPrompt(moveItem, draftStartWeek, draftEndWeek);
                  setShowDateModal(false);
                  setMoveItem(null);
                }}
              >
                <Text style={styles.modalBtn}>Save</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Start Week</Text>
            <View style={styles.chipRow}>
              {WEEKS.map((week) => (
                <Pressable
                  key={`ds-${week}`}
                  style={[styles.chip, draftStartWeek === week && styles.chipOn]}
                  onPress={() => {
                    const duration = draftEndWeek - draftStartWeek;
                    setDraftStartWeek(week);
                    setDraftEndWeek(Math.max(week, Math.min(13, week + Math.max(0, duration))));
                  }}
                >
                  <Text style={[styles.chipText, draftStartWeek === week && styles.chipTextOn]}>Wk {week}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>End Week</Text>
            <View style={styles.chipRow}>
              {WEEKS.filter((w) => w >= draftStartWeek).map((week) => (
                <Pressable key={`de-${week}`} style={[styles.chip, draftEndWeek === week && styles.chipOn]} onPress={() => setDraftEndWeek(week)}>
                  <Text style={[styles.chipText, draftEndWeek === week && styles.chipTextOn]}>Wk {week}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing['2xl'] },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.text.primary },
  subHeading: { color: colors.text.secondary, marginTop: 2 },
  addBtn: { backgroundColor: colors.primary, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  addBtnText: { color: colors.text.inverse, fontWeight: '700' },
  progressWrap: {
    marginHorizontal: spacing.lg,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: { height: 8, backgroundColor: colors.success },
  search: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterToggle: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterToggleText: { color: colors.text.secondary, fontWeight: '600' },
  filterPanel: { marginHorizontal: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  filterLabel: { color: colors.text.muted, fontSize: typography.sizes.xs, fontWeight: '700', marginTop: spacing.xs, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text.secondary, fontSize: typography.sizes.xs },
  chipTextOn: { color: colors.text.inverse, fontWeight: '700' },
  viewToggle: { margin: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  toggle: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  toggleOn: { backgroundColor: colors.primary },
  toggleText: { color: colors.text.secondary, fontWeight: '700' },
  toggleTextOn: { color: colors.text.inverse },
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  checkbox: { width: 40, alignItems: 'center', justifyContent: 'center' },
  checkboxText: { fontSize: 20 },
  rowContent: { flex: 1, paddingVertical: spacing.sm, paddingRight: spacing.sm },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center' },
  chevronBtn: { width: 22, alignItems: 'center', justifyContent: 'center' },
  chevronText: { color: colors.text.secondary, fontSize: typography.sizes.xs },
  chevronPlaceholder: { width: 22 },
  rowTitle: { flex: 1, color: colors.text.primary, fontSize: typography.sizes.base, fontWeight: '600' },
  rowTitleDone: { color: colors.text.muted, textDecorationLine: 'line-through' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  weekBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radii.full },
  weekBadgeText: { color: colors.text.secondary, fontSize: typography.sizes.xs, fontWeight: '700' },
  watkinsChip: { borderWidth: 1, borderRadius: radii.full, paddingHorizontal: spacing.xs, paddingVertical: 1 },
  watkinsChipText: { fontSize: typography.sizes.xs, fontWeight: '600' },
  category: { fontSize: typography.sizes.xs, color: colors.text.muted },
  progressBadge: { fontSize: typography.sizes.xs, color: colors.primary, fontWeight: '700' },
  topicSection: { marginBottom: spacing.sm },
  topicHeader: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F3F4F6',
    borderRadius: radii.md,
    borderLeftWidth: 4,
    marginBottom: spacing.xs,
  },
  topicHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicHeaderText: { fontSize: typography.sizes.base, fontWeight: '700', color: colors.text.primary },
  topicCount: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.text.muted },
  weekSection: { marginBottom: spacing.md },
  weekHeading: { marginHorizontal: spacing.lg, color: colors.text.primary, fontWeight: '700', fontSize: typography.sizes.lg },
  weekDates: { marginHorizontal: spacing.lg, color: colors.text.secondary, fontSize: typography.sizes.xs, marginBottom: spacing.xs },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing['2xl'] },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  modalBtn: { color: colors.accent, fontWeight: '700' },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text.primary },
  inputLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.text.primary },
  inputArea: { minHeight: 90, textAlignVertical: 'top' },
});
