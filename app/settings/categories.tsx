import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppStore } from '@/shared/store/app-store';
import { colors, radii, shadows, spacing, typography } from '@/shared/theme';
import { ScreenShell } from '@/shared/ui/screen-shell';

const palette = [
  '#E5EAF1',
  '#E9EDF3',
  '#F7DCE9',
  '#E7F3DE',
  '#DDEBFF',
  '#EFE2FB',
];

export default function CategoriesSettingsScreen() {
  const categories = useAppStore((state) => state.taskCategories);
  const createTaskCategory = useAppStore((state) => state.createTaskCategory);
  const updateTaskCategory = useAppStore((state) => state.updateTaskCategory);
  const archiveTaskCategory = useAppStore((state) => state.archiveTaskCategory);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(palette[0]);

  return (
    <ScreenShell>
      <View style={styles.card}>
        <Text style={styles.title}>Task categories</Text>
        <TextInput
          onChangeText={setLabel}
          placeholder="New category"
          style={styles.input}
          value={label}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.swatches}>
            {palette.map((item) => (
              <Pressable
                key={item}
                onPress={() => setColor(item)}
                style={[
                  styles.swatch,
                  { backgroundColor: item },
                  color === item && styles.swatchActive,
                ]}
              />
            ))}
          </View>
        </ScrollView>
        <Pressable
          onPress={() => {
            if (label.trim()) {
              createTaskCategory({ label: label.trim(), color });
              setLabel('');
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Create category</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {categories
          .filter((item) => !item.archived)
          .map((category) => (
            <View key={category.id} style={styles.row}>
              <Text style={styles.categoryText}>{category.label}</Text>
              {category.kind === 'custom' ? (
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() =>
                      updateTaskCategory(category.id, {
                        label: `${category.label} Plus`,
                      })
                    }
                  >
                    <Text style={styles.link}>Quick rename</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => archiveTaskCategory(category.id, 'personal')}
                  >
                    <Text style={styles.archive}>Archive</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.preset}>Preset</Text>
              )}
            </View>
          ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    ...shadows.card,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  input: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  swatches: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  swatchActive: { borderWidth: 3, borderColor: colors.brand },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  buttonLabel: { ...typography.bodyStrong, color: colors.surface },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryText: { ...typography.bodyStrong, color: colors.textPrimary },
  rowActions: { flexDirection: 'row', gap: spacing.md },
  link: { ...typography.caption, color: colors.brand },
  archive: { ...typography.caption, color: colors.accentRed },
  preset: { ...typography.caption, color: colors.textSecondary },
});
