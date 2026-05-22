import type { AnalysisResult } from '../context/AppContext';

export const conditionLabel: Record<AnalysisResult['condition'], string> = {
  Healthy: 'Saludable',
  Damaged: 'Dañado / Podrido',
  Overripe: 'Sobremaduro',
};

export const produceTypeLabel: Record<AnalysisResult['produceType'], string> = {
  Fruit: 'Fruta',
  Vegetable: 'Verdura',
};

export const produceNameEs: Record<string, string> = {
  Apple: 'Manzana',
  Banana: 'Plátano',
  Bellpepper: 'Pimiento',
  Carrot: 'Zanahoria',
  Cucumber: 'Pepino',
  Grape: 'Uva',
  Guava: 'Guayaba',
  Jujube: 'Jujube',
  Mango: 'Mango',
  Orange: 'Naranja',
  Pomegranate: 'Granada',
  Potato: 'Papa',
  Strawberry: 'Fresa',
  Tomato: 'Tomate',
};

export function produceDisplayName(name: string): string {
  return produceNameEs[name] ?? name;
}

export const analyzeStages = ['Subiendo', 'Procesando', 'Clasificando', 'Listo'] as const;
