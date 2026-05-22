import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { deleteUserAnalyses, saveAnalysis } from '../services/analyses';
import { isSupabaseConfigured } from '../../lib/supabase';

export interface AnalysisResult {
  id: string;
  produceName: string;
  produceType: 'Fruit' | 'Vegetable';
  condition: 'Healthy' | 'Damaged' | 'Overripe';
  fruitTypeConfidence: number;
  conditionConfidence: number;
  latency: number;
  imageUrl: string;
  resolution: string;
  fileSize: string;
  timestamp: Date;
}

interface AppContextType {
  currentImage: string | null;
  setCurrentImage: (url: string | null) => void;
  currentSampleHint: string;
  setCurrentSampleHint: (hint: string) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  history: AnalysisResult[];
  setHistory: (items: AnalysisResult[]) => void;
  historyImageCache: Record<string, string>;
  setHistoryImageCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  addToHistory: (result: AnalysisResult, userId?: string) => Promise<void>;
  clearHistory: (userId?: string) => Promise<void>;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentSampleHint, setCurrentSampleHint] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [historyImageCache, setHistoryImageCache] = useState<Record<string, string>>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addToHistory = useCallback(async (result: AnalysisResult, userId?: string) => {
    let savedId = result.id;

    if (isSupabaseConfigured && userId) {
      const dbId = await saveAnalysis(userId, result);
      if (dbId) savedId = dbId;
    }

    const stored: AnalysisResult = { ...result, id: savedId };

    if (result.imageUrl) {
      setHistoryImageCache((prev) => ({ ...prev, [savedId]: result.imageUrl }));
    }

    setHistory((prev) => [stored, ...prev.filter((h) => h.id !== savedId)].slice(0, 20));
  }, []);

  const clearHistory = useCallback(async (userId?: string) => {
    if (isSupabaseConfigured && userId) {
      await deleteUserAnalyses(userId);
    }
    setHistory([]);
    setHistoryImageCache({});
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentImage,
        setCurrentImage,
        currentSampleHint,
        setCurrentSampleHint,
        analysisResult,
        setAnalysisResult,
        history,
        setHistory,
        historyImageCache,
        setHistoryImageCache,
        addToHistory,
        clearHistory,
        isHistoryOpen,
        setIsHistoryOpen,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
