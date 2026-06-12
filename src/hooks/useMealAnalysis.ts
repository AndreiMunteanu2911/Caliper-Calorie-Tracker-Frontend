import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { MealAnalysis } from '@/src/types/api';

export function useMealAnalysis() {
  const [context, setContext] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeAsset(asset: ImagePicker.ImagePickerAsset) {
    if (!asset.base64) {
      setError('The selected image could not be read.');
      return;
    }
    setImageUri(asset.uri);
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(true);
    try {
      setAnalysis(
        await apiRequest<MealAnalysis>('/ai/analyze-plate', {
          method: 'POST',
          timeoutMs: 90_000,
          body: {
            image_base64: asset.base64,
            media_type: asset.mimeType ?? 'image/jpeg',
            context: context.trim() || null,
          },
        }),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to analyze this meal.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled) return;
    await analyzeAsset(result.assets[0]);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission is required to photograph a meal.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled) return;
    await analyzeAsset(result.assets[0]);
  }

  return {
    context,
    imageUri,
    analysis,
    isAnalyzing,
    error,
    setContext,
    choosePhoto,
    takePhoto,
  };
}
