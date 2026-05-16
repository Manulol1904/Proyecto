import { AnalysisResult } from '../context/AppContext';

const PRODUCE_DB: Record<string, Pick<AnalysisResult, 'produceName' | 'produceType' | 'fruitTypeConfidence' | 'conditionConfidence'>> = {
  apple:  { produceName: 'Apple',  produceType: 'Fruit',     fruitTypeConfidence: 96, conditionConfidence: 91 },
  banana: { produceName: 'Banana', produceType: 'Fruit',     fruitTypeConfidence: 98, conditionConfidence: 87 },
  grape:  { produceName: 'Grape',  produceType: 'Fruit',     fruitTypeConfidence: 94, conditionConfidence: 89 },
  tomato: { produceName: 'Tomato', produceType: 'Vegetable', fruitTypeConfidence: 97, conditionConfidence: 93 },
};

function jitter(base: number, range = 3): number {
  return Math.min(99, Math.max(55, base + Math.floor(Math.random() * range * 2) - range));
}

function randomCondition(): AnalysisResult['condition'] {
  const pool: AnalysisResult['condition'][] = ['Healthy', 'Healthy', 'Healthy', 'Damaged', 'Overripe'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function analyzeImage(imageUrl: string, hint?: string): Promise<AnalysisResult> {
  const start = performance.now();
  await new Promise(r => setTimeout(r, 1600 + Math.random() * 900));
  const latency = Math.round(performance.now() - start);

  const keys = Object.keys(PRODUCE_DB);
  const key = hint && PRODUCE_DB[hint] ? hint : keys[Math.floor(Math.random() * keys.length)];
  const data = PRODUCE_DB[key];

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    produceName: data.produceName,
    produceType: data.produceType,
    condition: randomCondition(),
    fruitTypeConfidence: jitter(data.fruitTypeConfidence),
    conditionConfidence: jitter(data.conditionConfidence),
    latency,
    imageUrl,
    resolution: '1024 × 768 px',
    fileSize: `${(Math.random() * 2.5 + 0.4).toFixed(1)} MB`,
    timestamp: new Date(),
  };
}
