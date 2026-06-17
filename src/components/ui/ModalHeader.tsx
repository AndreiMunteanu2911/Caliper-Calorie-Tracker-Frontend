import { XIcon } from 'phosphor-react-native';
import { Pressable, Text, View } from 'react-native';

type ModalHeaderProps = {
  title: string;
  description: string;
  onClose: () => void;
};

export function ModalHeader({
  title,
  description,
  onClose,
}: ModalHeaderProps) {
  return (
    <View className="flex-row items-start gap-3 border-b border-white/10 px-4 py-4">
      <View className="min-w-0 flex-1">
        <Text className="text-xl font-black text-white">{title}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-white/50">
          {description}
        </Text>
      </View>
      <Pressable
        accessibilityLabel="Close"
        className="h-9 w-9 items-center justify-center rounded-full bg-white/5"
        onPress={onClose}>
        <XIcon color="#FFFFFF" size={16} weight="bold" />
      </Pressable>
    </View>
  );
}
