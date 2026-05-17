export type OpenFoodFactsProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  nutrition_grades?: string;
  nutriscore_data?: {
    grade?: string;
    score?: number;
  };
  nutriments?: {
    carbohydrates_100g?: number;
    fiber_100g?: number;
    proteins_100g?: number;
    salt_100g?: number;
    'saturated-fat_100g'?: number;
    'energy-kcal_100g'?: number;
  };
  nova_group?: number;
  quantity?: string;
};

type OpenFoodFactsResponse = {
  code: string;
  product?: OpenFoodFactsProduct;
  status: number;
  status_verbose: string;
};

export type ProductLookupErrorCode = 'open_food_facts_unavailable' | 'product_not_found';

export class ProductLookupError extends Error {
  constructor(
    public readonly code: ProductLookupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ProductLookupError';
  }
}

const PRODUCT_FIELDS = [
  'product_name',
  'brands',
  'image_front_small_url',
  'ingredients_text',
  'ingredients_text_en',
  'nutrition_grades',
  'nutriscore_data',
  'nutriments',
  'nova_group',
  'quantity',
].join(',');

export async function fetchProductByBarcode(
  barcode: string,
  language: string,
): Promise<OpenFoodFactsProduct> {
  const response = await fetch(
    `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=${PRODUCT_FIELDS}&lc=${language}`,
  );

  //TODO: Error mapping
  if (!response.ok) {
    throw new ProductLookupError(
      'open_food_facts_unavailable',
      'Open Food Facts is unavailable right now.',
    );
  }

  const payload = (await response.json()) as OpenFoodFactsResponse;

  if (payload.status !== 1 || !payload.product) {
    throw new ProductLookupError('product_not_found', 'Product not found in Open Food Facts.');
  }

  return {
    ...payload.product,
    code: payload.code,
  };
}
