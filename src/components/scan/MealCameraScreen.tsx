import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Image as ImageIcon, RotateCcw } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useMealAnalysis } from '@/src/hooks/useMealAnalysis';

export function MealCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const analysis = useMealAnalysis();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);

  async function capture() {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.82,
      });
      if (!picture) return;
      router.back();
      await analysis.analyzeAsset({
        uri: picture.uri,
        base64: picture.base64 ?? null,
        mimeType: 'image/jpeg',
      });
    } finally {
      setIsCapturing(false);
    }
  }

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-brand px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-fats">
          <Camera color="#121212" size={28} />
        </View>
        <Text className="text-center text-2xl font-black text-white">Camera access</Text>
        <Text className="text-center leading-6 text-white/60">
          Allow camera access to photograph and analyze your meal.
        </Text>
        <Button label="Allow camera" onPress={() => void requestPermission()} />
        <Button label="Go back" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand">
      <CameraView ref={cameraRef} className="flex-1" facing={facing} />
      <View className="pointer-events-none absolute inset-0 bg-black/10" />
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 12 }}>
        <Pressable
          accessibilityLabel="Close camera"
          className="h-12 w-12 items-center justify-center rounded-full bg-black/55"
          onPress={() => router.back()}>
          <ChevronLeft color="#FFFFFF" size={25} />
        </Pressable>
        <Text className="text-xl font-black text-white">AI Camera</Text>
        <Pressable
          accessibilityLabel="Switch camera"
          className="h-12 w-12 items-center justify-center rounded-full bg-black/55"
          onPress={() =>
            setFacing((current) => (current === 'back' ? 'front' : 'back'))
          }>
          <RotateCcw color="#FFFFFF" size={21} />
        </Pressable>
      </View>

      <View className="pointer-events-none absolute inset-x-10 top-[22%] h-[44%] rounded-[36px] border-[3px] border-white">
        <View className="absolute left-0 right-0 top-1/2 h-px bg-accent" />
      </View>

      <View
        className="absolute inset-x-0 bottom-0 items-center rounded-t-[32px] bg-[#121212] px-6 pt-6"
        style={{ paddingBottom: insets.bottom + 20 }}>
        <View className="mb-7 flex-row items-center gap-2 rounded-2xl bg-[#2F2F2F] px-4 py-3">
          <ImageIcon color="#DDC0FF" size={18} />
          <Text className="text-sm text-white/70">
            Keep the full plate inside the frame
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Take meal photo"
          accessibilityRole="button"
          className="h-20 w-20 items-center justify-center rounded-full border-[3px] border-white"
          disabled={isCapturing}
          onPress={() => void capture()}>
          <View className="h-16 w-16 rounded-full bg-white" />
          {isCapturing ? (
            <View className="absolute">
              <LoadingSpinner />
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
