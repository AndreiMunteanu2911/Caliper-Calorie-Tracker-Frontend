import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { PlateAnalysis } from '@/src/types/api';

export function usePlateAnalysis() {
  const [context, setContext] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlateAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndAnalyze() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
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
        await apiRequest<PlateAnalysis>('/ai/analyze-plate', {
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
          : 'Unable to analyze this plate.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return {
    context,
    imageUri,
    analysis,
    isAnalyzing,
    error,
    setContext,
    pickAndAnalyze,
  };
}
