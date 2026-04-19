import type { OpenFoodFactsProduct } from '@/api/openFoodFacts';
import type { TFunction } from 'i18next';

type HealthVerdict = 'healthy' | 'not healthy' | 'unknown';

type HealthAnalysis = {
  grade?: string;
  hasSugarInFirstFive: boolean | null;
  hasLowFiberRatio: boolean | null;
  hasWholeGrainMismatch: boolean | null;
  proteinIntake: 'high' | 'medium' | 'low' | null;
};

const SUGAR_PATTERNS = [
  /\bsugar\b/,
  /\bsucrose\b/,
  /\bglucose\b/,
  /\bfructose\b/,
  /\bdextrose\b/,
  /\bmaltose\b/,
  /\blactose\b/,
  /\bgalactose\b/,
  /\btrehalose\b/,
  /\binvert sugar\b/,
  /\bbrown sugar\b/,
  /\bcane sugar\b/,
  /\braw sugar\b/,
  /\bbeet sugar\b/,
  /\bcoconut sugar\b/,
  /\bdate sugar\b/,
  /\bpalm sugar\b/,
  /\bpowdered sugar\b/,
  /\bicing sugar\b/,
  /\bconfectioners sugar\b/,
  /\bevaporated cane juice\b/,
  /\bcane juice\b/,
  /\bpanela\b/,
  /\bjaggery\b/,
  /\bmuscovado\b/,
  /\bdemerara\b/,
  /\bturbinado\b/,
  /\bmolasses\b/,
  /\bhoney\b/,
  /\bagave\b/,
  /\bmaple syrup\b/,
  /\bcorn syrup\b/,
  /\bhigh fructose corn syrup\b/,
  /\bglucose syrup\b/,
  /\bfructose syrup\b/,
  /\brice syrup\b/,
  /\bmalt syrup\b/,
  /\bgolden syrup\b/,
  /\bbarley malt\b/,
  /\bmalt extract\b/,
  /\bmaltodextrin\b/,
  /\bdextrin\b/,
  /\bcaramel syrup\b/,
  /\bfruit juice concentrate\b/,
  /\bapple juice concentrate\b/,
  /\bgrape juice concentrate\b/,
  /\bpear juice concentrate\b/,
  /\b(?:[a-z]+\s)?syrup\b/,
  /\b(?:[a-z]+\s)?nectar\b/,
];

const WHOLE_GRAIN_CLAIM_PATTERNS = [
  /\bwhole grain\b/,
  /\bwholegrain\b/,
  /\bwhole wheat\b/,
  /\bwholemeal\b/,
  /\bintegral(?:a|e|i)?\b/,
  /\bgraham\b/,
  /\bmultigrain\b/,
];

const WHOLE_GRAIN_FLOUR_PATTERNS = [
  /\bwhole wheat flour\b/,
  /\bwholemeal flour\b/,
  /\bwhole grain wheat flour\b/,
  /\bwhole grain flour\b/,
  /\bintegral flour\b/,
];

const REFINED_FLOUR_PATTERNS = [
  /\bwhite flour\b/,
  /\brefined flour\b/,
  /\bwheat flour\b/,
  /\benriched wheat flour\b/,
  /\bflour\b/
];

function getIngredientsText(product?: OpenFoodFactsProduct): string | undefined {
  return product?.ingredients_text_en ?? product?.ingredients_text;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^]]*]/g, ' ')
    .replace(/\{[^}]*}/g, ' ')
    .replace(/\d+([.,]\d+)?\s*%/g, ' ')
    .replace(/[_*]/g, ' ')
    .replace(/[-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIngredientName(ingredient: string): string {
  return normalizeText(ingredient);
}

function getFirstFiveIngredients(ingredientsText?: string): string[] {
  if (!ingredientsText) {
    return [];
  }

  return ingredientsText
    .split(/[;,]/)
    .map(normalizeIngredientName)
    .filter(Boolean)
    .slice(0, 5);
}

function hasSugarInFirstFiveIngredients(product?: OpenFoodFactsProduct): boolean | null {
  const firstFiveIngredients = getFirstFiveIngredients(getIngredientsText(product));

  if (firstFiveIngredients.length === 0) {
    return null;
  }

  return firstFiveIngredients.some((ingredient) =>
    SUGAR_PATTERNS.some((pattern) => pattern.test(ingredient)),
  );
}

function findFirstMatchingIngredientIndex(ingredients: string[], patterns: RegExp[]): number {
  return ingredients.findIndex((ingredient) =>
    patterns.some((pattern) => pattern.test(ingredient)),
  );
}

function hasWholeGrainMarketingMismatch(product?: OpenFoodFactsProduct): boolean | null {
  const marketingText = normalizeText([product?.product_name, product?.brands].filter(Boolean).join(' '));
  const firstFiveIngredients = getFirstFiveIngredients(getIngredientsText(product));

  if (firstFiveIngredients.length === 0) {
    return null;
  }

  const hasWholeGrainClaim = WHOLE_GRAIN_CLAIM_PATTERNS.some((pattern) => pattern.test(marketingText));

  if (!hasWholeGrainClaim) {
    return false;
  }

  const firstWholeGrainFlourIndex = findFirstMatchingIngredientIndex(
    firstFiveIngredients,
    WHOLE_GRAIN_FLOUR_PATTERNS,
  );
  const firstRefinedFlourIndex = findFirstMatchingIngredientIndex(
    firstFiveIngredients,
    REFINED_FLOUR_PATTERNS,
  );
  console.log(firstRefinedFlourIndex,firstWholeGrainFlourIndex )

  if (firstRefinedFlourIndex === -1) {
    return false;
  }

  if (firstWholeGrainFlourIndex === -1) {
    return true;
  }

  return firstRefinedFlourIndex < firstWholeGrainFlourIndex;
}

function hasLowFiberToCarbRatio(product?: OpenFoodFactsProduct): boolean | null {
  const carbohydrates = product?.nutriments?.carbohydrates_100g;
  const fiber = product?.nutriments?.fiber_100g;

  if (typeof carbohydrates !== 'number' || typeof fiber !== 'number') {
    return null;
  }

  if (carbohydrates <= 0) {
    return false;
  }

  return fiber < carbohydrates / 5;
}

function proteinIntake(product?: OpenFoodFactsProduct): 'high' | 'medium' | 'low' | null {
  const proteins = product?.nutriments?.proteins_100g;

  if (typeof proteins !== 'number') {
    return null;
  }

  if (proteins > 10) {
    return 'high';
  } else if (proteins < 10 && proteins >= 5) {
    return 'medium';
  }
  return 'low';
}

function analyzeHealth(product?: OpenFoodFactsProduct): HealthAnalysis {
  const grade = product?.nutrition_grades ?? product?.nutriscore_data?.grade;

  return {
    grade: grade?.toLowerCase(),
    hasSugarInFirstFive: hasSugarInFirstFiveIngredients(product),
    hasLowFiberRatio: hasLowFiberToCarbRatio(product),
    hasWholeGrainMismatch: hasWholeGrainMarketingMismatch(product),
    proteinIntake: proteinIntake(product),
  };
}

export function getHealthVerdict(product?: OpenFoodFactsProduct): HealthVerdict {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio, hasWholeGrainMismatch } =
    analyzeHealth(product);

  if (hasSugarInFirstFive || hasLowFiberRatio || hasWholeGrainMismatch) {
    return 'not healthy';
  }

  if (!grade) {
    return hasSugarInFirstFive === null &&
      hasLowFiberRatio === null &&
      hasWholeGrainMismatch === null
      ? 'unknown'
      : 'healthy';
  }

  if (grade === 'a' || grade === 'b') {
    return 'healthy';
  }

  return 'not healthy';
}

export function getHealthReason(product: OpenFoodFactsProduct | undefined, t: TFunction): string {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio, hasWholeGrainMismatch, proteinIntake } =
    analyzeHealth(product);
  const reasons: string[] = [];

  if (grade) {
    reasons.push(
      grade === 'a' || grade === 'b'
        ? t('health.gradeHealthy', { grade: grade.toUpperCase() })
        : t('health.gradeNotHealthy', { grade: grade.toUpperCase() }),
    );
  } else {
    reasons.push(t('health.noGrade'));
  }

  if (hasSugarInFirstFive === true) {
    reasons.push(t('health.sugarPresent'));
  } else if (hasSugarInFirstFive === false) {
    reasons.push(t('health.sugarAbsent'));
  } else {
    reasons.push(t('health.sugarUnavailable'));
  }

  if (hasLowFiberRatio === true) {
    reasons.push(t('health.fiberLow'));
  } else if (hasLowFiberRatio === false) {
    reasons.push(t('health.fiberOk'));
  } else {
    reasons.push(t('health.fiberUnavailable'));
  }

  if (hasWholeGrainMismatch === true) {
    reasons.push(t('health.wholeGrainMismatch'));
  }

  if (proteinIntake != null) {
    reasons.push(
      proteinIntake === 'high'
        ? t('health.proteinHigh')
        : proteinIntake === 'medium'
          ? t('health.proteinMedium')
          : t('health.proteinLow'),
    );
  }

  return reasons.join(' ');
}
