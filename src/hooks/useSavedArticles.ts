import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'congonews_saved_articles';

export type SavedArticleEntry = {
  id: number;
  title: string;
  savedAt: string;
};

function readStored(): SavedArticleEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is SavedArticleEntry =>
        x &&
        typeof x === 'object' &&
        typeof (x as SavedArticleEntry).id === 'number' &&
        typeof (x as SavedArticleEntry).title === 'string'
    );
  } catch {
    return [];
  }
}

function writeStored(entries: SavedArticleEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  window.dispatchEvent(new CustomEvent('saved-articles-changed'));
}

export function useSavedArticles() {
  const [list, setList] = useState<SavedArticleEntry[]>(() =>
    typeof window !== 'undefined' ? readStored() : []
  );

  useEffect(() => {
    const sync = () => setList(readStored());
    window.addEventListener('saved-articles-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('saved-articles-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isSaved = useCallback((id: number) => list.some((e) => e.id === id), [list]);

  const toggle = useCallback((id: number, title: string) => {
    const current = readStored();
    const idx = current.findIndex((e) => e.id === id);
    if (idx >= 0) {
      writeStored(current.filter((_, i) => i !== idx));
    } else {
      writeStored([
        { id, title, savedAt: new Date().toISOString() },
        ...current.filter((e) => e.id !== id),
      ]);
    }
    setList(readStored());
  }, []);

  const remove = useCallback((id: number) => {
    writeStored(readStored().filter((e) => e.id !== id));
    setList(readStored());
  }, []);

  return { list, isSaved, toggle, remove };
}
