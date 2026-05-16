const en = {
  common: {
    appName: 'Food Detective',
  },
  home: {
    eyebrow: 'Your label detective',
    title: 'Scan the label before it talks you into something.',
    description:
      'Scan a barcode and get a plain-English take on the nutrition score, ingredients, fiber, protein, and processing level.',
    cardTitle: 'What gets checked',
    cardTextPrimary:
      'I look past the front of the pack and check whether this product makes sense for everyday eating.',
    cardTextSecondary:
      'You get a clear call: good pick, compare first, or keep it occasional, with the reason right there.',
    startScanning: 'Start scanning',
    supportTitle: 'Decide faster at the shelf',
    supportText:
      'Useful at the supermarket, at home, or any time two products look healthy until you read the small print.',
    checks: {
      ingredients: 'Hidden sugars',
      fiber: 'Fiber balance',
      protein: 'Protein',
    },
  },
  scan: {
    permission: {
      title: 'Let Food Detective use your camera.',
      text: 'The camera is only used to read the barcode and look up the product.',
      button: 'Allow camera',
    },
    header: {
      title: 'Show me a barcode. I will read the label.',
    },
    camera: {
      alignHint: 'Keep the barcode inside the frame',
    },
    result: {
      readyTitle: 'Ready when you are',
      readyText: 'Point the camera at a barcode. I will check the product and tell you what to watch for.',
      checkingTitle: 'Reading the label',
      noResultTitle: 'I could not find this product',
      scanAnotherProduct: 'Scan another product',
      unnamedProduct: 'Unnamed product',
      unknownBrand: 'Unknown brand',
      barcodeLabel: 'Barcode',
      nutriScoreLabel: 'Nutri-Score',
      checksTitle: 'What I checked',
      notAvailable: 'N/A',
      novaLabel: 'NOVA {{group}}',
      verdict: {
        healthy: 'Healthy',
        notHealthy: 'Not healthy',
        unknown: 'Unknown',
      },
    },
    errors: {
      somethingWentWrong: 'Something went wrong while checking this product.',
      openFoodFactsUnavailable: 'The product database is not responding right now. Try again in a moment.',
      productNotFound: 'This product is not in Open Food Facts yet. Try another item.',
    },
  },
  coach: {
    title: 'Detective note',
    recommendation: {
      good: {
        title: 'Good everyday pick',
        body: 'Based on the available data, this looks like a reasonable choice.',
        action: 'Pick it if the portion, price, and taste work for you.',
      },
      compare: {
        title: 'Compare before you buy',
        body: 'One or two details are worth comparing with a similar product.',
        action: 'Look for a close alternative with less sugar, more fiber, or a better Nutri-Score.',
      },
      occasional: {
        title: 'Keep it occasional',
        body: 'This has enough warning signs that I would not make it a daily choice.',
        action: 'Treat it as an occasional buy or look for something simpler and less processed.',
      },
      unknown: {
        title: 'Not enough label data',
        body: 'The database is missing too much nutrition or ingredient detail for a confident call.',
        action: 'Check the package and favor short ingredient lists with foods you recognize.',
      },
    },
  },
  health: {
    gradeHealthy: 'Nutri-Score {{grade}} is a good sign.',
    gradeNotHealthy: 'Nutri-Score {{grade}} is a warning sign.',
    noGrade: 'This product does not have a Nutri-Score yet.',
    sugarPresent: 'Sugar shows up in the first 5 ingredients.',
    sugarAbsent: 'No sugar source shows up in the first 5 ingredients.',
    sugarUnavailable: 'The ingredient list is missing, so I could not check sugar placement.',
    fiberLow: 'Fiber is low for the amount of carbohydrates.',
    fiberOk: 'Fiber looks balanced for the amount of carbohydrates.',
    fiberUnavailable: 'Fiber or carbohydrate data is missing.',
    wholeGrainMismatch:
      'The whole-grain claim is questionable: refined flour appears before whole-grain flour.',
    proteinHigh: 'Good amount of protein.',
    proteinMedium: 'Moderate amount of protein.',
    proteinLow: 'Low amount of protein.',
    checks: {
      nutriScore: {
        label: 'Nutrition score',
        detail: 'Nutri-Score {{grade}} from Open Food Facts.',
      },
      sugar: {
        label: 'Sugar position',
      },
      fiber: {
        label: 'Fiber balance',
      },
      wholeGrain: {
        label: 'Whole grain claim',
      },
      protein: {
        label: 'Protein',
        unavailable: 'Protein data is missing for this product.',
      },
      nova: {
        label: 'Processing level',
        detail: 'NOVA group {{group}}.',
        unavailable: 'Processing level is missing for this product.',
      },
    },
  },
} as const;

export default en;
