import { View } from 'react-native';

import LogoNoText from '@/assets/images/logo-no-text.svg';
import LogoText from '@/assets/images/logo-text.svg';

type BrandMarkProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View className="overflow-hidden rounded-xl shadow-soft">
      {compact ? (
        <LogoNoText accessibilityLabel="Caliper" height={44} width={44} />
      ) : (
        <LogoText accessibilityLabel="Caliper" height={44} width={118} />
      )}
    </View>
  );
}
