import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { fetchUserAnalyses } from '../services/analyses';
import { isSupabaseConfigured } from '../../lib/supabase';

export function HistoryBootstrap() {
  const { user, isAuthenticated } = useAuth();
  const { setHistory, setHistoryImageCache } = useApp();

  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated || !user) {
      if (!isAuthenticated) {
        setHistory([]);
        setHistoryImageCache({});
      }
      return;
    }

    let cancelled = false;

    (async () => {
      const rows = await fetchUserAnalyses(user.id);
      if (!cancelled) setHistory(rows);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isAuthenticated, setHistory, setHistoryImageCache]);

  return null;
}
