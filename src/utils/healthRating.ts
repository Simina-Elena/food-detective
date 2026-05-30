import type { OpenFoodFactsProduct } from '@/api/openFoodFacts';
import type { TFunction } from 'i18next';

type CoachRecommendationLevel = 'good_match' | 'compare' | 'occasional' | 'unknown';
export type HealthCheckState = 'positive' | 'caution' | 'negative' | 'unknown';
type TrafficLevel = 'low' | 'medium' | 'high' | null;

type HealthAnalysis = {
  grade?: string;
  hasSugarInFirstFive: boolean | null;
  hasLowFiberRatio: boolean | null;
  hasWholeGrainMismatch: boolean | null;
  proteinIntake: 'high' | 'medium' | 'low' | null;
  saltLevel: TrafficLevel;
  saturatedFatLevel: TrafficLevel;
  caloriesLevel: TrafficLevel;
  additiveCount: number | null;
  hasPalmOil: boolean | null;
  hasArtificialSweeteners: boolean | null;
};

export type CoachRecommendation = {
  level: CoachRecommendationLevel;
  title: string;
  body: string;
  action: string;
};

export type HealthCheck = {
  id: string;
  label: string;
  detail: string;
  state: HealthCheckState;
};

export type HealthObject = {
  grade: string | undefined;
  recommendation: CoachRecommendation;
  healthChecks: HealthCheck[];
};

// --- Pattern constants ---

// Stevia is intentionally absent — it's a zero-calorie sweetener, not a sugar source.
// It is checked separately in ARTIFICIAL_SWEETENER_PATTERNS.
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

// "multigrain" intentionally excluded — it does not imply the grains are whole.
const WHOLE_GRAIN_CLAIM_PATTERNS = [
  /\bwhole grain\b/,
  /\bwholegrain\b/,
  /\bwhole wheat\b/,
  /\bwholemeal\b/,
  /\bintegral(?:a|e|i)?\b/,
  /\bgraham\b/,
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
  /\bwhite wheat flour\b/,
  /\ball purpose flour\b/,
  /\bplain flour\b/,
];

const PALM_OIL_PATTERNS = [
  /\bpalm oil\b/,
  /\bpalm fat\b/,
  /\bpalm kernel oil\b/,
  /\bpalm kernel fat\b/,
  /\bpalm olein\b/,
  /\bpalm stearin\b/,
];

const ARTIFICIAL_SWEETENER_PATTERNS = [
  /\baspartame\b/,
  /\bacesulfame\b/,
  /\bsucralose\b/,
  /\bsaccharin\b/,
  /\bcyclamate\b/,
  /\bstevia\b/,
  /\bsteviol\b/,
  /\bneotame\b/,
  /\badvantame\b/,
];

// --- Text utilities ---

function getIngredientsText(product?: OpenFoodFactsProduct): string | undefined {
  return product?.ingredients_text_en ?? product?.ingredients_text;
}

export function hasIngredientData(product?: OpenFoodFactsProduct): boolean {
  const text = getIngredientsText(product);
  return !!text && text.trim().length > 0;
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

function getFirstFiveIngredients(ingredientsText?: string): string[] {
  if (!ingredientsText) return [];
  return ingredientsText.split(/[;,]/).map(normalizeText).filter(Boolean).slice(0, 5);
}

// Guards against \bwheat flour\b matching inside "whole wheat flour":
// an ingredient is only treated as refined if it does NOT also match a whole-grain flour pattern.
function isRefinedFlour(ingredient: string): boolean {
  return (
    REFINED_FLOUR_PATTERNS.some((p) => p.test(ingredient)) &&
    !WHOLE_GRAIN_FLOUR_PATTERNS.some((p) => p.test(ingredient))
  );
}

// --- Analysis functions ---

function hasSugarInFirstFiveIngredients(product?: OpenFoodFactsProduct): boolean | null {
  const first5 = getFirstFiveIngredients(getIngredientsText(product));
  if (first5.length === 0) return null;
  return first5.some((ing) => SUGAR_PATTERNS.some((p) => p.test(ing)));
}

function hasWholeGrainMarketingMismatch(product?: OpenFoodFactsProduct): boolean | null {
  const marketingText = normalizeText(
    [product?.product_name, product?.brands].filter(Boolean).join(' '),
  );
  const first5 = getFirstFiveIngredients(getIngredientsText(product));

  if (first5.length === 0) return null;

  const hasWholeGrainClaim = WHOLE_GRAIN_CLAIM_PATTERNS.some((p) => p.test(marketingText));
  if (!hasWholeGrainClaim) return false;

  const wholeGrainIdx = first5.findIndex((ing) => WHOLE_GRAIN_FLOUR_PATTERNS.some((p) => p.test(ing)));
  const refinedIdx = first5.findIndex(isRefinedFlour);

  if (refinedIdx === -1) return false;
  if (wholeGrainIdx === -1) return true;
  return refinedIdx < wholeGrainIdx;
}

function hasLowFiberToCarbRatio(product?: OpenFoodFactsProduct): boolean | null {
  const carbs = product?.nutriments?.carbohydrates_100g;
  const fiber = product?.nutriments?.fiber_100g;
  if (typeof carbs !== 'number' || typeof fiber !== 'number' || isNaN(carbs) || isNaN(fiber)) return null;
  if (carbs <= 0) return false;
  return fiber < carbs / 5;
}

function getProteinIntake(product?: OpenFoodFactsProduct): 'high' | 'medium' | 'low' | null {
  const proteins = product?.nutriments?.proteins_100g;
  if (typeof proteins !== 'number') return null;
  if (proteins >= 10) return 'high';
  if (proteins >= 5) return 'medium';
  return 'low';
}

// EU traffic light — salt: low ≤ 0.3g, medium 0.3–1.5g, high > 1.5g per 100g
function getSaltLevel(product?: OpenFoodFactsProduct): TrafficLevel {
  const salt = product?.nutriments?.salt_100g;
  if (typeof salt !== 'number') return null;
  if (salt > 1.5) return 'high';
  if (salt > 0.3) return 'medium';
  return 'low';
}

// EU traffic light — saturated fat: low ≤ 1.5g, medium 1.5–5g, high > 5g per 100g
function getSaturatedFatLevel(product?: OpenFoodFactsProduct): TrafficLevel {
  const satFat = product?.nutriments?.['saturated-fat_100g'];
  if (typeof satFat !== 'number') return null;
  if (satFat > 5) return 'high';
  if (satFat > 1.5) return 'medium';
  return 'low';
}

// Informational — low ≤ 100 kcal, medium 100–350 kcal, high > 350 kcal per 100g
function getCaloriesLevel(product?: OpenFoodFactsProduct): TrafficLevel {
  const rawKcal = product?.nutriments?.['energy-kcal_100g'];
  const rawKj = product?.nutriments?.['energy-kj_100g'];
  const kcal =
    typeof rawKcal === 'number' && !isNaN(rawKcal)
      ? rawKcal
      : typeof rawKj === 'number' && !isNaN(rawKj)
        ? rawKj / 4.184
        : null;
  if (kcal === null) return null;
  if (kcal > 350) return 'high';
  if (kcal > 100) return 'medium';
  return 'low';
}

// Operates on raw text to preserve parenthesised E-number codes before normalisation strips them
function countAdditives(product?: OpenFoodFactsProduct): number | null {
  const text = getIngredientsText(product);
  if (!text) return null;
  const matches = text.toLowerCase().match(/\be\s*\d{3,4}\b/g);
  if (!matches) return 0;
  return new Set(matches.map((m) => m.replace(/\s/g, ''))).size;
}

function detectPalmOil(product?: OpenFoodFactsProduct): boolean | null {
  const text = getIngredientsText(product);
  if (!text) return null;
  return PALM_OIL_PATTERNS.some((p) => p.test(text.toLowerCase()));
}

function detectArtificialSweeteners(product?: OpenFoodFactsProduct): boolean | null {
  const text = getIngredientsText(product);
  if (!text) return null;
  const lower = text.toLowerCase();
  if (ARTIFICIAL_SWEETENER_PATTERNS.some((p) => p.test(lower))) return true;
  // E950–E962 and E969 cover the common EU sweetener E-numbers
  return /\be\s*9(?:5[0-9]|6[0-2]|69)\b/.test(lower);
}

function analyzeHealth(product?: OpenFoodFactsProduct): HealthAnalysis {
  const grade = product?.nutrition_grades ?? product?.nutriscore_data?.grade;
  return {
    grade: grade?.toLowerCase(),
    hasSugarInFirstFive: hasSugarInFirstFiveIngredients(product),
    hasLowFiberRatio: hasLowFiberToCarbRatio(product),
    hasWholeGrainMismatch: hasWholeGrainMarketingMismatch(product),
    proteinIntake: getProteinIntake(product),
    saltLevel: getSaltLevel(product),
    saturatedFatLevel: getSaturatedFatLevel(product),
    caloriesLevel: getCaloriesLevel(product),
    additiveCount: countAdditives(product),
    hasPalmOil: detectPalmOil(product),
    hasArtificialSweeteners: detectArtificialSweeteners(product),
  };
}

// --- Check-building helpers ---

function trafficCheck(
  id: string,
  label: string,
  level: TrafficLevel,
  messages: { low: string; medium: string; high: string; unavailable: string },
  states: { low: HealthCheckState; medium: HealthCheckState; high: HealthCheckState },
): HealthCheck {
  return {
    id,
    label,
    detail: level !== null ? messages[level] : messages.unavailable,
    state: level !== null ? states[level] : 'unknown',
  };
}

// For checks where true = something flagged and false = clear
function flagCheck(
  id: string,
  label: string,
  flagged: boolean | null,
  messages: { flagged: string; clear: string; unavailable: string },
  flaggedState: HealthCheckState,
): HealthCheck {
  return {
    id,
    label,
    detail: flagged === true ? messages.flagged : flagged === false ? messages.clear : messages.unavailable,
    state: flagged === true ? flaggedState : flagged === false ? 'positive' : 'unknown',
  };
}

// --- Verdict and recommendation ---

function getVerdict(analysis: HealthAnalysis): 'healthy' | 'not healthy' | 'unknown' {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio, hasWholeGrainMismatch, saltLevel, saturatedFatLevel } =
    analysis;

  if (hasSugarInFirstFive || hasLowFiberRatio || hasWholeGrainMismatch || saltLevel === 'high' || saturatedFatLevel === 'high') {
    return 'not healthy';
  }

  if (!grade) {
    return hasSugarInFirstFive === null && hasLowFiberRatio === null && hasWholeGrainMismatch === null
      ? 'unknown'
      : 'healthy';
  }

  return grade === 'a' || grade === 'b' ? 'healthy' : 'not healthy';
}

function buildCoachRecommendation(analysis: HealthAnalysis, t: TFunction): CoachRecommendation {
  const verdict = getVerdict(analysis);

  const redFlagCount = [
    analysis.hasSugarInFirstFive,
    analysis.hasLowFiberRatio,
    analysis.hasWholeGrainMismatch,
    analysis.saltLevel === 'high',
    analysis.saturatedFatLevel === 'high',
    analysis.additiveCount !== null && analysis.additiveCount >= 3,
    analysis.hasPalmOil,
  ].filter((f) => f === true).length;

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

function buildHealthChecks(
  analysis: HealthAnalysis,
  novaGroup: number | undefined,
  t: TFunction,
): HealthCheck[] {
  const {
    grade,
    hasSugarInFirstFive,
    hasLowFiberRatio,
    hasWholeGrainMismatch,
    proteinIntake,
    saltLevel,
    saturatedFatLevel,
    caloriesLevel,
    additiveCount,
    hasPalmOil,
    hasArtificialSweeteners,
  } = analysis;

  const checks: HealthCheck[] = [];

  checks.push({
    id: 'nutriScore',
    label: t('health.checks.nutriScore.label'),
    detail: grade ? t('health.checks.nutriScore.detail', { grade: grade.toUpperCase() }) : t('health.noGrade'),
    state: grade
      ? grade === 'a' || grade === 'b'
        ? 'positive'
        : grade === 'c'
          ? 'caution'
          : 'negative'
      : 'unknown',
  });

  checks.push(
    flagCheck('sugar', t('health.checks.sugar.label'), hasSugarInFirstFive, {
      flagged: t('health.sugarPresent'),
      clear: t('health.sugarAbsent'),
      unavailable: t('health.sugarUnavailable'),
    }, 'negative'),
  );

  checks.push(
    flagCheck('fiber', t('health.checks.fiber.label'), hasLowFiberRatio, {
      flagged: t('health.fiberLow'),
      clear: t('health.fiberOk'),
      unavailable: t('health.fiberUnavailable'),
    }, 'caution'),
  );

  if (hasWholeGrainMismatch === true) {
    checks.push({
      id: 'wholeGrain',
      label: t('health.checks.wholeGrain.label'),
      detail: t('health.wholeGrainMismatch'),
      state: 'negative',
    });
  }

  checks.push(
    trafficCheck('protein', t('health.checks.protein.label'), proteinIntake, {
      low: t('health.proteinLow'),
      medium: t('health.proteinMedium'),
      high: t('health.proteinHigh'),
      unavailable: t('health.checks.protein.unavailable'),
    }, { low: 'negative', medium: 'caution', high: 'positive' }),
  );

  checks.push(
    trafficCheck('salt', t('health.checks.salt.label'), saltLevel, {
      low: t('health.saltLow'),
      medium: t('health.saltMedium'),
      high: t('health.saltHigh'),
      unavailable: t('health.checks.salt.unavailable'),
    }, { low: 'positive', medium: 'caution', high: 'negative' }),
  );

  checks.push(
    trafficCheck('saturatedFat', t('health.checks.saturatedFat.label'), saturatedFatLevel, {
      low: t('health.saturatedFatLow'),
      medium: t('health.saturatedFatMedium'),
      high: t('health.saturatedFatHigh'),
      unavailable: t('health.checks.saturatedFat.unavailable'),
    }, { low: 'positive', medium: 'caution', high: 'negative' }),
  );

  checks.push(
    trafficCheck('calories', t('health.checks.calories.label'), caloriesLevel, {
      low: t('health.caloriesLow'),
      medium: t('health.caloriesMedium'),
      high: t('health.caloriesHigh'),
      unavailable: t('health.checks.calories.unavailable'),
    }, { low: 'positive', medium: 'caution', high: 'caution' }),
  );

  checks.push({
    id: 'additives',
    label: t('health.checks.additives.label'),
    detail:
      additiveCount === null
        ? t('health.checks.additives.unavailable')
        : additiveCount === 0
          ? t('health.additivesNone')
          : t('health.additivesFound', { count: additiveCount }),
    state:
      additiveCount === null ? 'unknown' : additiveCount === 0 ? 'positive' : additiveCount <= 2 ? 'caution' : 'negative',
  });

  checks.push(
    flagCheck('palmOil', t('health.checks.palmOil.label'), hasPalmOil, {
      flagged: t('health.palmOilPresent'),
      clear: t('health.palmOilAbsent'),
      unavailable: t('health.checks.palmOil.unavailable'),
    }, 'negative'),
  );

  checks.push(
    flagCheck('sweeteners', t('health.checks.sweeteners.label'), hasArtificialSweeteners, {
      flagged: t('health.sweetenersPresent'),
      clear: t('health.sweetenersAbsent'),
      unavailable: t('health.checks.sweeteners.unavailable'),
    }, 'caution'),
  );

  checks.push({
    id: 'nova',
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

// --- Public API ---

export function getHealthObject(
  product: OpenFoodFactsProduct | undefined,
  t: TFunction,
): HealthObject {
  const analysis = analyzeHealth(product);
  return {
    grade: analysis.grade,
    recommendation: buildCoachRecommendation(analysis, t),
    healthChecks: buildHealthChecks(analysis, product?.nova_group, t),
  };
}

export function getCoachRecommendation(
  product: OpenFoodFactsProduct | undefined,
  t: TFunction,
): CoachRecommendation {
  return buildCoachRecommendation(analyzeHealth(product), t);
}

export function getHealthChecks(
  product: OpenFoodFactsProduct | undefined,
  t: TFunction,
): HealthCheck[] {
  const analysis = analyzeHealth(product);
  return buildHealthChecks(analysis, product?.nova_group, t);
}
