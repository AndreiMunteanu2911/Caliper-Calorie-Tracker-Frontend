import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

type DropdownProps = {
  children: ReactNode;
  className?: string;
};

export function Dropdown({ children, className = '' }: DropdownProps) {
  return (
    <ScrollView
      className={`caliper-scrollbar overflow-hidden rounded-[24px] border border-[#4A4A4A] bg-[#1C1C1C] shadow-card ${className}`}
      contentContainerClassName="p-1.5"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      style={{ maxHeight: 430 }}>
      {children}
    </ScrollView>
  );
}
