import type { OpenFoodFactsProduct } from '@/api/openFoodFacts';

type HealthVerdict = 'healthy' | 'not healthy' | 'unknown';

type HealthAnalysis = {
  grade?: string;
  hasSugarInFirstFive: boolean | null;
  hasLowFiberRatio: boolean | null;
  proteinIntake: string | null;
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

function getIngredientsText(product?: OpenFoodFactsProduct): string | undefined {
  return product?.ingredients_text_en ?? product?.ingredients_text;
}

function normalizeIngredientName(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\d+([.,]\d+)?\s*%/g, ' ')
    .replace(/[_*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function proteinIntake(product?: OpenFoodFactsProduct): string | null {
  const proteins = product?.nutriments?.proteins_100g;

  if (typeof proteins !== 'number') {
    return null;
  }

  if (proteins > 10) {
    return "Nice protein intake."
  } else if (proteins < 10 && proteins >= 5) {
    return "Medium protein intake."
  }
  return "Low protein intake."

}

function analyzeHealth(product?: OpenFoodFactsProduct): HealthAnalysis {
  const grade = product?.nutrition_grades ?? product?.nutriscore_data?.grade;

  return {
    grade: grade?.toLowerCase(),
    hasSugarInFirstFive: hasSugarInFirstFiveIngredients(product),
    hasLowFiberRatio: hasLowFiberToCarbRatio(product),
    proteinIntake: proteinIntake(product)
  };
}

export function getHealthVerdict(product?: OpenFoodFactsProduct): HealthVerdict {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio } = analyzeHealth(product);

  if (hasSugarInFirstFive || hasLowFiberRatio) {
    return 'not healthy';
  }

  if (!grade) {
    return hasSugarInFirstFive === null && hasLowFiberRatio === null ? 'unknown' : 'healthy';
  }

  if (grade === 'a' || grade === 'b') {
    return 'healthy';
  }

  return 'not healthy';
}

export function getHealthReason(product?: OpenFoodFactsProduct): string {
  const { grade, hasSugarInFirstFive, hasLowFiberRatio, proteinIntake } = analyzeHealth(product);
  const reasons: string[] = [];

  if (grade) {
    reasons.push(
      grade === 'a' || grade === 'b'
        ? `Nutri-Score ${grade.toUpperCase()} is treated as healthy.`
        : `Nutri-Score ${grade.toUpperCase()} is treated as not healthy.`,
    );
  } else {
    reasons.push('No Nutri-Score is available for this product yet.');
  }

  if (hasSugarInFirstFive === true) {
    reasons.push('A sugar source appears in the first 5 ingredients.');
  } else if (hasSugarInFirstFive === false) {
    reasons.push('No sugar source appears in the first 5 ingredients.');
  } else {
    reasons.push('Ingredients are unavailable, so sugar placement could not be checked.');
  }

  if (hasLowFiberRatio === true) {
    reasons.push('Fiber is below 1g per 5g of carbohydrates.');
  } else if (hasLowFiberRatio === false) {
    reasons.push('Fiber meets or exceeds 1g per 5g of carbohydrates.');
  } else {
    reasons.push('Fiber and carbohydrate data are unavailable for the fiber check.');
  }

  if (proteinIntake != null) {
    reasons.push(proteinIntake);
  }

  return reasons.join(' ');
}
