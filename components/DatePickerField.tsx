/**
 * DatePickerField — a cross-platform date picker wrapper.
 * Uses a pure-JS/React Native approach compatible with Expo Go.
 * No native modules required.
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radii } from '../lib/theme';

interface DatePickerFieldProps {
  value: string; // ISO string "YYYY-MM-DD" or empty
  onChange: (date: string) => void;
  label?: string;
  hint?: string;
}

function parseDate(iso: string): { year: number; month: number; day: number } {
  if (!iso) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function formatDisplay(iso: string): string {
  if (!iso) return 'Tap to choose date';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function DatePickerField({ value, onChange, label, hint }: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const parsed = parseDate(value);
  const [tempYear, setTempYear] = useState(parsed.year);
  const [tempMonth, setTempMonth] = useState(parsed.month);
  const [tempDay, setTempDay] = useState(parsed.day);

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${colors.border}`,
            borderRadius: radii.md,
            padding: '10px 12px',
            fontSize: typography.sizes.base,
            color: colors.text.primary,
            width: '100%',
            boxSizing: 'border-box' as any,
          }}
        />
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
  const days = Array.from({ length: daysInMonth(tempYear, tempMonth) }, (_, i) => i + 1);

  function handleConfirm() {
    const iso = `${tempYear}-${String(tempMonth).padStart(2, '0')}-${String(tempDay).padStart(2, '0')}`;
    onChange(iso);
    setShowPicker(false);
  }

  function openPicker() {
    const p = parseDate(value);
    setTempYear(p.year);
    setTempMonth(p.month);
    setTempDay(p.day);
    setShowPicker(true);
  }

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable style={styles.button} onPress={openPicker}>
        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {formatDisplay(value)}
        </Text>
        <Text style={styles.calIcon}>📅</Text>
      </Pressable>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.pickerCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>Select Date</Text>

            <View style={styles.pickerRow}>
              {/* Day */}
              <View style={styles.pickerCol}>
                <Text style={styles.colLabel}>Day</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity key={d} style={[styles.option, tempDay === d && styles.optionActive]} onPress={() => setTempDay(d)}>
                      <Text style={[styles.optionText, tempDay === d && styles.optionTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month */}
              <View style={[styles.pickerCol, { flex: 2 }]}>
                <Text style={styles.colLabel}>Month</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity key={m} style={[styles.option, tempMonth === i + 1 && styles.optionActive]} onPress={() => setTempMonth(i + 1)}>
                      <Text style={[styles.optionText, tempMonth === i + 1 && styles.optionTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year */}
              <View style={styles.pickerCol}>
                <Text style={styles.colLabel}>Year</Text>
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity key={y} style={[styles.option, tempYear === y && styles.optionActive]} onPress={() => setTempYear(y)}>
                      <Text style={[styles.optionText, tempYear === y && styles.optionTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  buttonText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.muted,
  },
  calIcon: { fontSize: 18 },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 380,
  },
  pickerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 200,
  },
  pickerCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.accent,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  pickerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
