import { useState } from 'react';

export type ScanMode = 'search' | 'meal';

export function useScanScreenState() {
  const [mode, setMode] = useState<ScanMode>('search');
  const [query, setQuery] = useState('');
  return { mode, query, setMode, setQuery };
}
