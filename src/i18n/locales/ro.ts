const ro = {
  common: {
    appName: 'Food Detective',
  },
  home: {
    eyebrow: 'Food Detective',
    title: 'Scaneaza alimente ambalate si primesti rapid o evaluare a cat de sanatoase sunt.',
    description:
      'Foloseste scannerul de coduri de bare pentru a identifica produse, a prelua date din Open Food Facts si a vedea un verdict simplu bazat pe scorul nutritional disponibil.',
    cardTitle: 'Cum functioneaza',
    cardTextPrimary:
      'Indreapta camera spre codul de bare al unui produs, iar aplicatia va cauta articolul pentru tine.',
    cardTextSecondary:
      'Dupa identificare, Food Detective evidentiaza numele produsului, brandul si un verdict usor de citit.',
    startScanning: 'Incepe scanarea',
  },
  scan: {
    permission: {
      title: 'Accesul la camera este necesar pentru scanarea codurilor de bare.',
      text: 'Folosim camera pentru a citi codul de bare, apoi preluam produsul din Open Food Facts.',
      button: 'Permite accesul la camera',
    },
    header: {
      title: 'Scaneaza un cod de bare ca sa verifici daca produsul este sanatos.',
    },
    camera: {
      alignHint: 'Aliniaza codul de bare in interiorul cadrului',
    },
    result: {
      readyTitle: 'Gata de scanare',
      readyText: 'Indreapta camera spre codul de bare al unui produs pentru a incepe.',
      checkingTitle: 'Verific produsul',
      noResultTitle: 'Niciun rezultat',
      scanAnotherProduct: 'Scaneaza alt produs',
      unnamedProduct: 'Produs fara nume',
      unknownBrand: 'Brand necunoscut',
      barcodeLabel: 'Cod de bare',
      nutriScoreLabel: 'Nutri-Score',
      notAvailable: 'N/A',
      novaLabel: 'NOVA {{group}}',
      verdict: {
        healthy: 'Sanatos',
        notHealthy: 'Nesanatos',
        unknown: 'Necunoscut',
      },
    },
    errors: {
      somethingWentWrong: 'A aparut o eroare.',
      openFoodFactsUnavailable: 'Open Food Facts nu este disponibil momentan.',
      productNotFound: 'Produsul nu a fost gasit in Open Food Facts.',
    },
  },
  health: {
    gradeHealthy: 'Nutri-Score {{grade}} este considerat sanatos.',
    gradeNotHealthy: 'Nutri-Score {{grade}} este considerat nesanatos.',
    noGrade: 'Acest produs nu are inca un Nutri-Score disponibil.',
    sugarPresent: 'O sursa de zahar apare in primele 5 ingrediente.',
    sugarAbsent: 'Nicio sursa de zahar nu apare in primele 5 ingrediente.',
    sugarUnavailable: 'Ingredientele nu sunt disponibile, asa ca pozitia zaharului nu a putut fi verificata.',
    fiberLow: 'Fibrele sunt sub 1g la fiecare 5g de carbohidrati.',
    fiberOk: 'Fibrele ating sau depasesc 1g la fiecare 5g de carbohidrati.',
    fiberUnavailable: 'Datele despre fibre si carbohidrati nu sunt disponibile pentru aceasta verificare.',
    wholeGrainMismatch:
      'Mesajul de tip integral pare inconsistent cu ordinea ingredientelor: faina rafinata apare inaintea fainei integrale.',
    proteinHigh: 'Aport bun de proteine.',
    proteinMedium: 'Aport mediu de proteine.',
    proteinLow: 'Aport scazut de proteine.',
  },
} as const;

export default ro;
