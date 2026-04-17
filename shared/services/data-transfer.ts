import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

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
        dialogTitle: 'Export Sanctum data',
      });
    }
    return fileUri;
  } catch {
    Alert.alert('Export failed', 'Could not export data. Please try again.');
    return null;
  }
};

export const pickAndImportState = async () => {
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
      'Import failed',
      error instanceof Error
        ? error.message
        : 'The selected file is not a valid Sanctum export.',
    );
    return null;
  }
};
