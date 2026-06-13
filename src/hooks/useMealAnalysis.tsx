import * as ImagePicker from 'expo-image-picker';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import { apiRequest } from '@/src/lib/api-client';
import type { MealAnalysis } from '@/src/types/api';

type MealAsset = Pick<
  ImagePicker.ImagePickerAsset,
  'base64' | 'mimeType' | 'uri'
>;

type MealAnalysisContextValue = {
  context: string;
  analysis: MealAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  setContext: (context: string) => void;
  analyzeAsset: (asset: MealAsset) => Promise<void>;
  choosePhoto: () => Promise<void>;
};

const MealAnalysisContext = createContext<MealAnalysisContextValue | null>(null);

export function MealAnalysisProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeAsset(asset: MealAsset) {
    if (!asset.base64) {
      setError('The selected image could not be read.');
      return;
    }
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

  return (
    <MealAnalysisContext.Provider
      value={{
        context,
        analysis,
        isAnalyzing,
        error,
        setContext,
        analyzeAsset,
        choosePhoto,
      }}>
      {children}
    </MealAnalysisContext.Provider>
  );
}

export function useMealAnalysis() {
  const context = useContext(MealAnalysisContext);
  if (!context) {
    throw new Error('useMealAnalysis must be used inside MealAnalysisProvider.');
  }
  return context;
}
