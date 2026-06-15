import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Search } from 'lucide-react-native';

type DropdownProps = {
  children: ReactNode;
  className?: string;
  resultCount?: number;
  query?: string;
};

export function Dropdown({ children, className = '', resultCount, query }: DropdownProps) {
  return (
    <View
      className={`overflow-hidden rounded-3xl border border-white/10 bg-[#1C1C1C] shadow-card ${className}`}>
      <View className="flex-row items-center gap-2.5 border-b border-white/8 px-5 py-3.5">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
          <Search color="#FF5A16" size={14} strokeWidth={2.5} />
        </View>
        <Text className="text-xs font-bold text-white/40">
          {resultCount !== undefined
            ? `${resultCount} result${resultCount === 1 ? '' : 's'} for `
            : 'Results for '
          }
          {query ? (
            <Text className="font-black text-white/70">{query}</Text>
          ) : null}
          {query ? '`' : ''}
        </Text>
      </View>
      <View className="p-2.5">
        {children}
      </View>
    </View>
  );
}
