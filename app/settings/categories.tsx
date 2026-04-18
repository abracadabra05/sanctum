import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getTaskCategoryLabel, useI18n } from '@/shared/i18n';
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
  const { language, t } = useI18n();
  const categories = useAppStore((state) => state.taskCategories);
  const createTaskCategory = useAppStore((state) => state.createTaskCategory);
  const updateTaskCategory = useAppStore((state) => state.updateTaskCategory);
  const archiveTaskCategory = useAppStore((state) => state.archiveTaskCategory);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(palette[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCategories = useMemo(
    () => categories.filter((item) => !item.archived),
    [categories],
  );

  const isEditing = Boolean(editingId);

  const handleSave = () => {
    if (!label.trim()) {
      setError(t('settings.categories.errorRequired'));
      return;
    }

    if (editingId) {
      updateTaskCategory(editingId, { label: label.trim(), color });
    } else {
      createTaskCategory({ label: label.trim(), color });
    }

    setLabel('');
    setColor(palette[0]);
    setEditingId(null);
    setError(null);
  };

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
          {t('settings.categories.title')}
        </Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {t('settings.categories.body')}
        </Text>

        <TextInput
          onChangeText={(value) => {
            setLabel(value);
            if (error) {
              setError(null);
            }
          }}
          placeholder={t('settings.categories.placeholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.input,
              color: theme.colors.textPrimary,
              borderColor: error ? theme.colors.accentRed : 'transparent',
              borderWidth: 1,
            },
          ]}
          value={label}
        />
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.accentRed }]}>
            {error}
          </Text>
        ) : null}

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

        <View style={styles.actions}>
          <Pressable
            onPress={handleSave}
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
            <Text
              style={[styles.buttonLabel, { color: theme.colors.textOnTint }]}
            >
              {isEditing
                ? t('settings.categories.saveUpdate')
                : t('settings.categories.saveCreate')}
            </Text>
          </Pressable>
          {isEditing ? (
            <Pressable
              onPress={() => {
                setEditingId(null);
                setLabel('');
                setColor(palette[0]);
              }}
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <Text
                style={[
                  styles.secondaryLabel,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {t('common.cancel')}
              </Text>
            </Pressable>
          ) : null}
        </View>
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
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          {t('settings.categories.sectionTitle')}
        </Text>
        {activeCategories.map((category) => {
          const fallbackCategory =
            activeCategories.find(
              (item) => item.id !== category.id && !item.archived,
            ) ?? null;

          return (
            <View
              key={category.id}
              style={[
                styles.row,
                { backgroundColor: theme.colors.surfaceMuted },
              ]}
            >
              <View style={styles.rowBody}>
                <View
                  style={[styles.dot, { backgroundColor: category.color }]}
                />
                <View style={styles.rowCopy}>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {getTaskCategoryLabel(category, language)}
                  </Text>
                  <Text
                    style={[
                      styles.categoryMeta,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {category.kind === 'preset'
                      ? t('settings.categories.meta.preset')
                      : fallbackCategory
                        ? t('settings.categories.meta.archiveFallback', {
                            fallback: getTaskCategoryLabel(
                              fallbackCategory,
                              language,
                            ),
                          })
                        : t('settings.categories.meta.custom')}
                  </Text>
                </View>
              </View>
              {category.kind === 'custom' ? (
                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => {
                      setEditingId(category.id);
                      setLabel(category.label);
                      setColor(category.color);
                      setError(null);
                    }}
                  >
                    <Text style={[styles.link, { color: theme.colors.brand }]}>
                      {t('common.edit')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!fallbackCategory) {
                        setError(t('settings.categories.errorNeedFallback'));
                        return;
                      }

                      archiveTaskCategory(category.id, fallbackCategory.id);
                      setError(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.archive,
                        { color: theme.colors.accentRed },
                      ]}
                    >
                      {t('common.archive')}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Text
                  style={[styles.preset, { color: theme.colors.textSecondary }]}
                >
                  {t('common.locked')}
                </Text>
              )}
            </View>
          );
        })}
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
  body: { ...typography.body },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...typography.bodyStrong,
  },
  errorText: { ...typography.caption, marginTop: -spacing.sm },
  swatches: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  button: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonLabel: { ...typography.bodyStrong },
  secondaryLabel: { ...typography.bodyStrong, fontSize: 15 },
  sectionTitle: { ...typography.h2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowCopy: { flex: 1, gap: 2 },
  categoryText: { ...typography.bodyStrong },
  categoryMeta: { ...typography.caption, lineHeight: 18 },
  rowActions: { flexDirection: 'row', gap: spacing.md },
  link: { ...typography.caption, fontSize: 14 },
  archive: { ...typography.caption, fontSize: 14 },
  preset: { ...typography.caption, fontSize: 14 },
});
