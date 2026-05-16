import { createContext, useContext, useState, ReactNode } from 'react';

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
  addToHistory: (result: AnalysisResult) => void;
  clearHistory: () => void;
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addToHistory = (result: AnalysisResult) => {
    setHistory(prev => [result, ...prev].slice(0, 20));
  };

  const clearHistory = () => setHistory([]);

  return (
    <AppContext.Provider value={{
      currentImage, setCurrentImage,
      currentSampleHint, setCurrentSampleHint,
      analysisResult, setAnalysisResult,
      history, addToHistory, clearHistory,
      isHistoryOpen, setIsHistoryOpen,
      isSettingsOpen, setIsSettingsOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
