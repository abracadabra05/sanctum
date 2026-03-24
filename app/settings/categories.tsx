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
import { radii, spacing, typography, useTheme } from '@/shared/theme';
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
  const theme = useTheme();
  const categories = useAppStore((state) => state.taskCategories);
  const createTaskCategory = useAppStore((state) => state.createTaskCategory);
  const updateTaskCategory = useAppStore((state) => state.updateTaskCategory);
  const archiveTaskCategory = useAppStore((state) => state.archiveTaskCategory);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(palette[0]);

  return (
    <ScreenShell>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            shadowColor: theme.shadows.card.shadowColor,
            shadowOffset: theme.shadows.card.shadowOffset,
            shadowOpacity: theme.shadows.card.shadowOpacity,
            shadowRadius: theme.shadows.card.shadowRadius,
            elevation: theme.shadows.card.elevation,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Task categories
        </Text>
        <TextInput
          onChangeText={setLabel}
          placeholder="New category"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
            },
          ]}
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
                  color === item && {
                    borderWidth: 3,
                    borderColor: theme.colors.brand,
                  },
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
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.brand,
              shadowColor: theme.shadows.button.shadowColor,
              shadowOffset: theme.shadows.button.shadowOffset,
              shadowOpacity: theme.shadows.button.shadowOpacity,
              shadowRadius: theme.shadows.button.shadowRadius,
              elevation: theme.shadows.button.elevation,
            },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: theme.colors.surface }]}>
            Create category
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            shadowColor: theme.shadows.card.shadowColor,
            shadowOffset: theme.shadows.card.shadowOffset,
            shadowOpacity: theme.shadows.card.shadowOpacity,
            shadowRadius: theme.shadows.card.shadowRadius,
            elevation: theme.shadows.card.elevation,
          },
        ]}
      >
        {categories
          .filter((item) => !item.archived)
          .map((category) => (
            <View key={category.id} style={styles.row}>
              <Text
                style={[
                  styles.categoryText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {category.label}
              </Text>
              {category.kind === 'custom' ? (
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() =>
                      updateTaskCategory(category.id, {
                        label: `${category.label} Plus`,
                      })
                    }
                  >
                    <Text style={[styles.link, { color: theme.colors.brand }]}>
                      Quick rename
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => archiveTaskCategory(category.id, 'personal')}
                  >
                    <Text
                      style={[
                        styles.archive,
                        { color: theme.colors.accentRed },
                      ]}
                    >
                      Archive
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Text
                  style={[styles.preset, { color: theme.colors.textSecondary }]}
                >
                  Preset
                </Text>
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
    borderRadius: radii.card,
    padding: spacing.xl,
  },
  title: { ...typography.h1 },
  input: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  swatches: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  button: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.bodyStrong },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryText: { ...typography.bodyStrong },
  rowActions: { flexDirection: 'row', gap: spacing.md },
  link: { ...typography.caption },
  archive: { ...typography.caption },
  preset: { ...typography.caption },
});
