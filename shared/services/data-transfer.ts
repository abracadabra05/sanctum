import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import {
  exportAppStatePayload,
  importAppStatePayload,
} from '@/shared/storage/adapter';
import type { AppState } from '@/shared/types/app';

export const exportStateToJson = async (state: AppState) => {
  const payload = exportAppStatePayload(state);
  const fileUri = `${FileSystem.cacheDirectory}sanctum-export.json`;
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
};

export const pickAndImportState = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
  return importAppStatePayload(JSON.parse(raw));
};
