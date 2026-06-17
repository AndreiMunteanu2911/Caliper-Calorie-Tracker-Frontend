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
  setAnalysis: (analysis: MealAnalysis | null) => void;
  analyzeAsset: (asset: MealAsset) => Promise<void>;
  choosePhoto: () => Promise<void>;
};

const MealAnalysisContext = createContext<MealAnalysisContextValue | null>(null);
const MAX_IMAGE_SIDE = 1280;
const MAX_UPLOAD_BASE64_LENGTH = 3_800_000;

function canCompressInBrowser() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof Image !== 'undefined'
  );
}

function stripDataUrlPrefix(value: string) {
  const commaIndex = value.indexOf(',');
  return value.startsWith('data:') && commaIndex >= 0
    ? value.slice(commaIndex + 1)
    : value;
}

async function compressImageForUpload(asset: MealAsset): Promise<MealAsset> {
  if (!asset.base64 || !canCompressInBrowser()) {
    return asset;
  }

  const inputDataUrl = asset.base64.startsWith('data:')
    ? asset.base64
    : `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error('The selected image could not be read.'));
    nextImage.src = inputDataUrl;
  });

  const maxSide = Math.max(image.width, image.height);
  const initialScale = Math.min(1, MAX_IMAGE_SIDE / Math.max(maxSide, 1));
  let width = Math.max(1, Math.round(image.width * initialScale));
  let height = Math.max(1, Math.round(image.height * initialScale));
  let quality = 0.74;
  let output = asset.base64;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) break;

    context.drawImage(image, 0, 0, width, height);
    output = stripDataUrlPrefix(canvas.toDataURL('image/jpeg', quality));

    if (output.length <= MAX_UPLOAD_BASE64_LENGTH) {
      return {
        ...asset,
        base64: output,
        mimeType: 'image/jpeg',
      };
    }

    if (quality > 0.46) {
      quality -= 0.1;
    } else {
      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
    }
  }

  return {
    ...asset,
    base64: output,
    mimeType: 'image/jpeg',
  };
}

export function MealAnalysisProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeAsset(asset: MealAsset) {
    let preparedAsset: MealAsset;
    try {
      preparedAsset = await compressImageForUpload(asset);
    } catch (compressionError) {
      setError(
        compressionError instanceof Error
          ? compressionError.message
          : 'The selected image could not be read.',
      );
      return;
    }
    if (!preparedAsset.base64) {
      setError('The selected image could not be read.');
      return;
    }
    if (preparedAsset.base64.length > MAX_UPLOAD_BASE64_LENGTH) {
      setError('The selected image is too large. Please crop it or choose a smaller photo.');
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
            image_base64: preparedAsset.base64,
            media_type: preparedAsset.mimeType ?? 'image/jpeg',
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
      quality: 0.6,
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
        setAnalysis,
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
