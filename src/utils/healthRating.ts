import type { OpenFoodFactsProduct } from '@/api/openFoodFacts';
import type { TFunction } from 'i18next';

type HealthVerdict = 'healthy' | 'not healthy' | 'unknown';
type CoachRecommendationLevel = 'good_match' | 'compare' | 'occasional' | 'unknown';
type HealthCheckState = 'positive' | 'caution' | 'negative' | 'unknown';

type HealthAnalysis = {
  grade?: string;
  hasSugarInFirstFive: boolean | null;
  hasLowFiberRatio: boolean | null;
  hasWholeGrainMismatch: boolean | null;
  proteinIntake: 'high' | 'medium' | 'low' | null;
};

export type CoachRecommendation = {
  level: CoachRecommendationLevel;
  title: string;
  body: string;
  action: string;
};

export type HealthCheck = {
  label: string;
  detail: string;
  state: HealthCheckState;
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

export function getCoachRecommendation(
  product: OpenFoodFactsProduct | undefined,
  t: TFunction,
): CoachRecommendation {
  const analysis = analyzeHealth(product);
  const verdict = getHealthVerdict(product);
  const redFlagCount = [
    analysis.hasSugarInFirstFive,
    analysis.hasLowFiberRatio,
    analysis.hasWholeGrainMismatch,
  ].filter((check) => check === true).length;

  if (verdict === 'healthy') {
    return {
      level: 'good_match',
      title: t('coach.recommendation.good.title'),
      body: t('coach.recommendation.good.body'),
      action: t('coach.recommendation.good.action'),
    };
  }

  if (verdict === 'unknown') {
    return {
      level: 'unknown',
      title: t('coach.recommendation.unknown.title'),
      body: t('coach.recommendation.unknown.body'),
      action: t('coach.recommendation.unknown.action'),
    };
  }

  if (analysis.grade === 'd' || analysis.grade === 'e' || redFlagCount >= 2) {
    return {
      level: 'occasional',
      title: t('coach.recommendation.occasional.title'),
      body: t('coach.recommendation.occasional.body'),
      action: t('coach.recommendation.occasional.action'),
    };
  }

  return {
    level: 'compare',
    title: t('coach.recommendation.compare.title'),
    body: t('coach.recommendation.compare.body'),
    action: t('coach.recommendation.compare.action'),
  };
}

export function getHealthChecks(
  product: OpenFoodFactsProduct | undefined,
  t: TFunction,
): HealthCheck[] {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio, hasWholeGrainMismatch, proteinIntake } =
    analyzeHealth(product);
  const novaGroup = product?.nova_group;
  const checks: HealthCheck[] = [];

  checks.push({
    label: t('health.checks.nutriScore.label'),
    detail: grade
      ? t('health.checks.nutriScore.detail', { grade: grade.toUpperCase() })
      : t('health.noGrade'),
    state: grade ? (grade === 'a' || grade === 'b' ? 'positive' : grade === 'c' ? 'caution' : 'negative') : 'unknown',
  });

  checks.push({
    label: t('health.checks.sugar.label'),
    detail:
      hasSugarInFirstFive === true
        ? t('health.sugarPresent')
        : hasSugarInFirstFive === false
          ? t('health.sugarAbsent')
          : t('health.sugarUnavailable'),
    state:
      hasSugarInFirstFive === true
        ? 'negative'
        : hasSugarInFirstFive === false
          ? 'positive'
          : 'unknown',
  });

  checks.push({
    label: t('health.checks.fiber.label'),
    detail:
      hasLowFiberRatio === true
        ? t('health.fiberLow')
        : hasLowFiberRatio === false
          ? t('health.fiberOk')
          : t('health.fiberUnavailable'),
    state:
      hasLowFiberRatio === true ? 'caution' : hasLowFiberRatio === false ? 'positive' : 'unknown',
  });

  if (hasWholeGrainMismatch === true) {
    checks.push({
      label: t('health.checks.wholeGrain.label'),
      detail: t('health.wholeGrainMismatch'),
      state: 'negative',
    });
  }

  checks.push({
    label: t('health.checks.protein.label'),
    detail:
      proteinIntake === 'high'
        ? t('health.proteinHigh')
        : proteinIntake === 'medium'
          ? t('health.proteinMedium')
          : proteinIntake === 'low'
            ? t('health.proteinLow')
            : t('health.checks.protein.unavailable'),
    state:
      proteinIntake === 'high'
        ? 'positive'
        : proteinIntake === 'medium'
          ? 'caution'
          : proteinIntake === 'low'
            ? 'negative'
            : 'unknown',
  });

  checks.push({
    label: t('health.checks.nova.label'),
    detail: novaGroup
      ? t('health.checks.nova.detail', { group: novaGroup })
      : t('health.checks.nova.unavailable'),
    state: novaGroup
      ? novaGroup <= 2
        ? 'positive'
        : novaGroup === 3
          ? 'caution'
          : 'negative'
      : 'unknown',
  });

  return checks;
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
