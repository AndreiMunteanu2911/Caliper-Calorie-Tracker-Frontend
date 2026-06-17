import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { CameraIcon, ImageIcon, ArrowCounterClockwiseIcon } from 'phosphor-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui/Button';
import { BackButton } from '@/src/components/ui/BackButton';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useMealAnalysis } from '@/src/hooks/useMealAnalysis';
import { BLACK_CAMERA_POSTER } from '@/src/lib/camera';
import { isNativeCapacitor } from '@/src/lib/capacitor';
import { shadows } from '@/src/lib/shadows';

export function MealCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const analysis = useMealAnalysis();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const shouldUsePermissionGate = !isNativeCapacitor();

  async function capture() {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      });
      if (!picture) return;
      router.replace('/meal-analysis');
      await analysis.analyzeAsset({
        uri: picture.uri,
        base64: picture.base64 ?? null,
        mimeType: 'image/jpeg',
      });
    } finally {
      setIsCapturing(false);
    }
  }

  if (shouldUsePermissionGate && !permission) {
    return (
      <View className="flex-1 items-center justify-center bg-brand">
        <LoadingSpinner />
      </View>
    );
  }

  if (shouldUsePermissionGate && !permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-brand px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-fats">
          <CameraIcon color="#121212" size={28} weight="bold" />
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
    <View className="flex-1 items-center bg-brand">
      <View
        className="relative h-full w-full overflow-hidden bg-brand"
        style={[{ flex: 1, maxWidth: 448, width: '100%' }, shadows.card]}>
        <CameraView
          ref={cameraRef}
          facing={facing}
          poster={BLACK_CAMERA_POSTER}
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}
        />
        <View className="pointer-events-none absolute inset-0 bg-black/10" />
        <View
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
          style={{ paddingTop: insets.top + 12 }}>
          <BackButton
            accessibilityLabel="Close camera"
            onPress={() => router.back()}
          />
          <Text className="text-lg font-black text-white">AI Camera</Text>
          <Pressable
            accessibilityLabel="Switch camera"
            className="h-11 w-11 items-center justify-center rounded-full bg-black/55"
            onPress={() =>
              setFacing((current) => (current === 'back' ? 'front' : 'back'))
            }>
            <ArrowCounterClockwiseIcon color="#FFFFFF" size={21} weight="bold" />
          </Pressable>
        </View>

        <View className="pointer-events-none absolute inset-x-10 top-[22%] h-[44%] rounded-3xl border-4 border-white">
          <View className="absolute left-0 right-0 top-1/2 h-px bg-accent" />
        </View>

        <View
          className="absolute inset-x-0 bottom-0 items-center rounded-t-3xl bg-[#121212] px-6 pt-6"
          style={{ paddingBottom: insets.bottom + 20 }}>
          <View className="mb-7 flex-row items-center gap-2 rounded-2xl bg-[#2F2F2F] px-4 py-3">
            <ImageIcon color="#DDC0FF" size={18} weight="bold" />
            <Text className="text-sm text-white/70">
              Keep the full plate inside the frame
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Take meal photo"
            accessibilityRole="button"
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
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
    </View>
  );
}
