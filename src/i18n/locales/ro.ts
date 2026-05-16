const ro = {
  common: {
    appName: 'Food Detective',
  },
  home: {
    eyebrow: 'Detectivul tău de etichete',
    title: 'Scanează eticheta înainte să te convingă ambalajul.',
    description:
      'Scanezi codul de bare și primești o explicație pe înțelesul tău despre scorul nutrițional, ingrediente, fibre, proteine și cât de procesat e produsul.',
    cardTitle: 'Ce verific',
    cardTextPrimary:
      'Trec de promisiunile de pe fața ambalajului și verific dacă produsul are sens pentru mesele de zi cu zi.',
    cardTextSecondary:
      'Primești un verdict simplu: alegere bună, compară înainte sau păstrează-l ocazional, plus motivul.',
    startScanning: 'Începe scanarea',
    supportTitle: 'Decizi mai repede la raft',
    supportText:
      'Util la supermarket, acasă sau oricând două produse par sănătoase până citești eticheta mică.',
    checks: {
      ingredients: 'Zahăr ascuns',
      fiber: 'Echilibru de fibre',
      protein: 'Proteine',
    },
  },
  scan: {
    permission: {
      title: 'Permite accesul la cameră.',
      text: 'Camera este folosită doar ca să citesc codul de bare și să găsesc produsul.',
      button: 'Permite camera',
    },
    header: {
      title: 'Arată-mi codul de bare. Eu citesc eticheta.',
    },
    camera: {
      alignHint: 'Ține codul de bare în interiorul cadrului',
    },
    result: {
      readyTitle: 'Sunt gata',
      readyText: 'Îndreaptă camera spre codul de bare. Verific produsul și îți spun la ce merită să fii atent.',
      checkingTitle: 'Citesc eticheta',
      noResultTitle: 'Nu am găsit produsul',
      scanAnotherProduct: 'Scanează alt produs',
      unnamedProduct: 'Produs fără nume',
      unknownBrand: 'Brand necunoscut',
      barcodeLabel: 'Cod de bare',
      nutriScoreLabel: 'Nutri-Score',
      checksTitle: 'Ce am verificat',
      notAvailable: 'N/A',
      novaLabel: 'NOVA {{group}}',
      verdict: {
        healthy: 'Sănătos',
        notHealthy: 'De evitat zilnic',
        unknown: 'Necunoscut',
      },
    },
    errors: {
      somethingWentWrong: 'A apărut o eroare în timp ce verificam produsul.',
      openFoodFactsUnavailable: 'Baza de date nu răspunde momentan. Încearcă din nou în câteva clipe.',
      productNotFound: 'Produsul nu este încă în Open Food Facts. Încearcă alt produs.',
    },
  },
  coach: {
    title: 'Nota detectivului',
    recommendation: {
      good: {
        title: 'Bun pentru zi cu zi',
        body: 'Din datele disponibile, pare o alegere rezonabilă.',
        action: 'Alege-l dacă ți se potrivește ca gust, preț și porție.',
      },
      compare: {
        title: 'Compară înainte să cumperi',
        body: 'Unul sau două detalii merită comparate cu un produs similar.',
        action: 'Caută o variantă apropiată cu mai puțin zahăr, mai multe fibre sau un Nutri-Score mai bun.',
      },
      occasional: {
        title: 'Păstrează-l ocazional',
        body: 'Are suficiente semne de întrebare încât nu l-aș face alegere zilnică.',
        action: 'Ia-l ca răsfăț ocazional sau caută ceva mai simplu și mai puțin procesat.',
      },
      unknown: {
        title: 'Am nevoie de mai multe date',
        body: 'Lipsesc prea multe informații despre nutriție sau ingrediente ca să dau un verdict clar.',
        action: 'Verifică ambalajul și caută liste scurte de ingrediente, cu alimente pe care le recunoști.',
      },
    },
  },
  health: {
    gradeHealthy: 'Nutri-Score {{grade}} e un semn bun.',
    gradeNotHealthy: 'Nutri-Score {{grade}} ridică un semn de întrebare.',
    noGrade: 'Produsul nu are încă Nutri-Score.',
    sugarPresent: 'Zahărul apare în primele 5 ingrediente.',
    sugarAbsent: 'Nu apare nicio sursă de zahăr în primele 5 ingrediente.',
    sugarUnavailable: 'Lista de ingrediente lipsește, deci nu pot verifica poziția zahărului.',
    fiberLow: 'Are puține fibre pentru cantitatea de carbohidrați.',
    fiberOk: 'Fibrele sunt în echilibru cu nivelul de carbohidrați.',
    fiberUnavailable: 'Lipsesc datele despre fibre sau carbohidrați.',
    wholeGrainMismatch:
      'Mențiunea „integral” pare discutabilă: făina rafinată apare înaintea făinii integrale.',
    proteinHigh: 'Are o cantitate bună de proteine.',
    proteinMedium: 'Are o cantitate moderată de proteine.',
    proteinLow: 'Are puține proteine.',
    checks: {
      nutriScore: {
        label: 'Scor nutrițional',
        detail: 'Nutri-Score {{grade}} din Open Food Facts.',
      },
      sugar: {
        label: 'Poziția zahărului',
      },
      fiber: {
        label: 'Echilibru de fibre',
      },
      wholeGrain: {
        label: 'Mențiune integrală',
      },
      protein: {
        label: 'Proteine',
        unavailable: 'Lipsesc datele despre proteine pentru acest produs.',
      },
      nova: {
        label: 'Nivel de procesare',
        detail: 'Grupa NOVA {{group}}.',
        unavailable: 'Lipsesc datele despre nivelul de procesare.',
      },
    },
  },
} as const;

export default ro;
