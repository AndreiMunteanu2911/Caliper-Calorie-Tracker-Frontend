import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type ScanMode = 'barcode' | 'search' | 'plate';

export function useScanScreenState() {
  const [mode, setMode] = useState<ScanMode>('barcode');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  return { mode, query, isFocused, setMode, setQuery };
}
