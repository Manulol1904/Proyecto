import { AnalysisResult } from '../context/AppContext';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

interface ApiAnalyzeResponse {
  produceName: string;
  produceType: 'Fruit' | 'Vegetable';
  condition: 'Healthy' | 'Damaged' | 'Overripe';
  fruitTypeConfidence: number;
  conditionConfidence: number;
  latency: number;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

function imageMetadata(imageUrl: string, blob: Blob): Pick<AnalysisResult, 'resolution' | 'fileSize'> {
  const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        resolution: `${img.naturalWidth} × ${img.naturalHeight} px`,
        fileSize: `${sizeMb} MB`,
      });
    };
    img.onerror = () => {
      resolve({
        resolution: '—',
        fileSize: `${sizeMb} MB`,
      });
    };
    img.src = imageUrl;
  });
}

async function analyzeWithApi(imageUrl: string): Promise<AnalysisResult> {
  const start = performance.now();
  const blob = await dataUrlToBlob(imageUrl);
  const formData = new FormData();
  formData.append('image', blob, 'capture.jpg');

  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as ApiAnalyzeResponse;
  const meta = await imageMetadata(imageUrl, blob);
  const latency = data.latency ?? Math.round(performance.now() - start);

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    produceName: data.produceName,
    produceType: data.produceType,
    condition: data.condition,
    fruitTypeConfidence: Math.round(data.fruitTypeConfidence),
    conditionConfidence: Math.round(data.conditionConfidence),
    latency,
    imageUrl,
    ...meta,
    timestamp: new Date(),
  };
}

export async function analyzeImage(imageUrl: string, hint?: string): Promise<AnalysisResult> {
  if (!API_URL) {
    const { analyzeImage: mockAnalyze } = await import('./mockAnalysis');
    return mockAnalyze(imageUrl, hint);
  }

  return analyzeWithApi(imageUrl);
}

export function isApiConfigured(): boolean {
  return Boolean(API_URL);
}
