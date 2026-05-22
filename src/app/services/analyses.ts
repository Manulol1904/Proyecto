import { AnalysisResult } from '../context/AppContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export interface AnalysisRow {
  id: string;
  user_id: string;
  produce_name: string;
  produce_type: 'Fruit' | 'Vegetable';
  condition: 'Healthy' | 'Damaged' | 'Overripe';
  fruit_type_confidence: number;
  condition_confidence: number;
  latency_ms: number;
  resolution: string | null;
  file_size: string | null;
  created_at: string;
}

function rowToResult(row: AnalysisRow, imageUrl = ''): AnalysisResult {
  return {
    id: row.id,
    produceName: row.produce_name,
    produceType: row.produce_type,
    condition: row.condition,
    fruitTypeConfidence: row.fruit_type_confidence,
    conditionConfidence: row.condition_confidence,
    latency: row.latency_ms,
    imageUrl,
    resolution: row.resolution ?? '—',
    fileSize: row.file_size ?? '—',
    timestamp: new Date(row.created_at),
  };
}

export async function fetchUserAnalyses(userId: string, limit = 20): Promise<AnalysisResult[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error cargando historial:', error.message);
    return [];
  }

  return (data as AnalysisRow[]).map((row) => rowToResult(row));
}

export async function saveAnalysis(userId: string, result: AnalysisResult): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      produce_name: result.produceName,
      produce_type: result.produceType,
      condition: result.condition,
      fruit_type_confidence: result.fruitTypeConfidence,
      condition_confidence: result.conditionConfidence,
      latency_ms: result.latency,
      resolution: result.resolution,
      file_size: result.fileSize,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error guardando análisis:', error.message);
    return null;
  }

  return data.id as string;
}

export async function deleteUserAnalyses(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const { error } = await supabase.from('analyses').delete().eq('user_id', userId);

  if (error) {
    console.error('Error borrando historial:', error.message);
    return false;
  }

  return true;
}
