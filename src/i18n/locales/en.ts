const en = {
  common: {
    appName: 'Food Detective',
  },
  home: {
    eyebrow: 'Food Detective',
    title: 'Scan packaged foods and get a quick health read before you buy.',
    description:
      'Use the barcode scanner to identify products, fetch data from Open Food Facts, and see a simple verdict based on the available nutrition score.',
    cardTitle: 'How it works',
    cardTextPrimary:
      'Point your camera at a product barcode and let the app look up the item for you.',
    cardTextSecondary:
      'Once found, Food Detective highlights the product name, brand, and an easy-to-read health verdict.',
    startScanning: 'Start scanning',
  },
  scan: {
    permission: {
      title: 'Camera access is required to scan product barcodes.',
      text: 'We use the camera to read a barcode, then fetch the product from Open Food Facts.',
      button: 'Allow camera',
    },
    header: {
      title: 'Scan a barcode to check whether a product is healthy.',
    },
    camera: {
      alignHint: 'Align the barcode inside the frame',
    },
    result: {
      readyTitle: 'Ready to scan',
      readyText: 'Point the camera at a product barcode to start.',
      checkingTitle: 'Checking product',
      noResultTitle: 'No result',
      scanAnotherProduct: 'Scan another product',
      unnamedProduct: 'Unnamed product',
      unknownBrand: 'Unknown brand',
      barcodeLabel: 'Barcode',
      nutriScoreLabel: 'Nutri-Score',
      notAvailable: 'N/A',
      novaLabel: 'NOVA {{group}}',
      verdict: {
        healthy: 'Healthy',
        notHealthy: 'Not healthy',
        unknown: 'Unknown',
      },
    },
    errors: {
      somethingWentWrong: 'Something went wrong.',
      openFoodFactsUnavailable: 'Open Food Facts is unavailable right now.',
      productNotFound: 'Product not found in Open Food Facts.',
    },
  },
  health: {
    gradeHealthy: 'Nutri-Score {{grade}} is treated as healthy.',
    gradeNotHealthy: 'Nutri-Score {{grade}} is treated as not healthy.',
    noGrade: 'No Nutri-Score is available for this product yet.',
    sugarPresent: 'A sugar source appears in the first 5 ingredients.',
    sugarAbsent: 'No sugar source appears in the first 5 ingredients.',
    sugarUnavailable: 'Ingredients are unavailable, so sugar placement could not be checked.',
    fiberLow: 'Fiber is below 1g per 5g of carbohydrates.',
    fiberOk: 'Fiber meets or exceeds 1g per 5g of carbohydrates.',
    fiberUnavailable: 'Fiber and carbohydrate data are unavailable for the fiber check.',
    proteinHigh: 'Nice protein intake.',
    proteinMedium: 'Medium protein intake.',
    proteinLow: 'Low protein intake.',
  },
} as const;

export default en;
