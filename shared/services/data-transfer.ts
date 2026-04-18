import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import {
  DEFAULT_APP_LANGUAGE,
  translate,
  type AppLanguage,
} from '@/shared/i18n/messages';
import {
  exportAppStatePayload,
  importAppStatePayload,
} from '@/shared/storage/adapter';
import type { AppState } from '@/shared/types/app';

export const exportStateToJson = async (state: AppState) => {
  try {
    const payload = exportAppStatePayload(state);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const fileUri = `${FileSystem.cacheDirectory}sanctum-export-${timestamp}.json`;
    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(payload, null, 2),
    );
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: translate(
          state.preferences.language,
          'dataTransfer.exportDialogTitle',
        ),
      });
    }
    return fileUri;
  } catch {
    Alert.alert(
      translate(state.preferences.language, 'dataTransfer.exportFailedTitle'),
      translate(state.preferences.language, 'dataTransfer.exportFailedBody'),
    );
    return null;
  }
};

export const pickAndImportState = async (
  language: AppLanguage = DEFAULT_APP_LANGUAGE,
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = JSON.parse(raw);
    return importAppStatePayload(parsed);
  } catch (error) {
    Alert.alert(
      translate(language, 'dataTransfer.importFailedTitle'),
      error instanceof Error
        ? error.message
        : translate(language, 'dataTransfer.importFailedBody'),
    );
    return null;
  }
};
