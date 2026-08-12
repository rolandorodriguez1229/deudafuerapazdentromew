// English copy. TypeScript enforces that this file covers every key in `es.ts`
// — if a Spanish string is added and this one is not, the build fails.
//
// Same rules as the Spanish: always APR (never "TAE"), always HYSA (never
// "money market"), no blame language, no exclamation marks in alerts, and the
// IPD is always a decimal (0.89, never 89%).

import type { Copy } from './es';

export const en: Copy = {
  disclaimer:
    'Educational and informational tool; it is not financial, legal, or tax advice.',
  disclaimerRegulatorio:
    'This tool does not manage, negotiate, or settle debts for you, does not receive or handle payments, and is not a debt management or debt relief service.',

  common: {
    noBlame: 'There is no blame here, only strategy.',
    firstVictory: 'You just won your first victory: you are no longer walking blind.',
    bankTrap: 'The bank approves debts your life cannot pay.',
    estimate: 'Estimated',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving…',
    perMonth: 'per month',
    months: 'months',
    of: 'of',
    langLabel: 'Language',
  },

  nav: {
    panel: 'Your dashboard',
    oxigeno: 'Oxygen Panel',
    deudas: 'Your debts',
    escenarios: 'Scenarios',
    cuenta: 'Your account',
    signOut: 'Sign out',
  },

  phase: {
    SIN_DEUDAS: {
      name: 'Debt free',
      headline: 'You are living debt free.',
      message:
        'Your next step is the lean fund: 0.5 to 2 months of essential expenses in a HYSA. Once it is full, every dollar you free up is yours.',
      color: 'verde',
    },
    SIN_INGRESO: {
      name: 'No income on file',
      headline: 'We cannot calculate your DPI yet.',
      message:
        'The DPI divides by your monthly take-home income, so we need that number to give you your phase. If your income today is zero, start with the Oxygen Panel: the extra income lever is the one that applies.',
      color: 'rojo',
    },
    DEFICIT: {
      name: 'Deficit',
      headline: 'You are in the tightest spot there is: every dollar has to buy air.',
      message:
        'Your month costs more than what comes in, so your first job is creating a surplus. And everything you get — a gig, a sale, a cut — goes to the debt that gives you back the most monthly payment per dollar invested. That is your Cash Flow ROI.',
      color: 'rojo',
    },
    OXIGENO: {
      name: 'Oxygen',
      headline: 'Your priority is getting air back with the least capital possible.',
      message:
        'Your minimum payments are drowning you. Attack the debt with the highest Cash Flow ROI: the one that frees the most monthly payment per dollar you need to clear it. Every payment freed here stays with you forever.',
      color: 'rojo',
    },
    BOLA_DE_NIEVE: {
      name: 'Snowball',
      headline: 'You can breathe. Now build momentum.',
      message:
        'You have air in your month. Put every extra dollar on the smallest balance: each account you cross off frees its minimum payment and feeds the next one.',
      color: 'amarillo',
    },
    AVALANCHA: {
      name: 'Avalanche',
      headline: 'Your cash flow is solid. Now cut the cost.',
      message:
        'You are no longer fighting to survive the month, so it pays to minimize what you hand the bank: attack the highest APR first.',
      color: 'verde',
    },
  },

  orderStrategy: {
    roi_flujo: 'Highest Cash Flow ROI first — the one that frees the most per dollar',
    saldo_menor: 'Smallest balance first (Snowball)',
    apr_mas_alta: 'Highest APR first (Avalanche)',
  },

  attackReason: {
    fuga_eterna: 'Endless leak: the minimum does not reduce principal and the call did not help',
    atada_al_empleo: 'Tied to your job — cleared before you move on to optimizing interest',
    fase: 'Your phase order',
  },

  utilization: {
    label: 'Utilization',
    ideal: 'Ideal (under 9%)',
    aceptable: 'Acceptable (under 30%)',
    alta: 'High',
    critica: 'Critical (above 80%)',
  },

  alerts: {
    fugaEterna:
      'This minimum does not reduce your debt by a single dollar — this account grows even when you pay.',
    fugaEternaLlamar:
      'You cannot out-pay this one at your current level: you are putting in less than it generates in interest every month. Call and ask for a lower APR or a hardship program. This is the first call to make.',
    fugaEternaPrimero:
      'If you already called and they would not help, this one goes first: as long as it stays this way, it grows every month.',
    stuckProjection:
      'At your current payments this debt never goes down: the minimum does not even cover the interest.',
    concentracion: 'Spreading it around feels productive and moves nothing. Concentrate.',
    concentracionRegla: 'Minimum on everything, all the extra on ONE debt. This is yours.',
    balanceOverLimit: 'Your balance is above your credit limit. Double-check the number.',
    minOverBalance: 'Your minimum payment is larger than your balance. This debt closes this month.',
  },

  renegotiate: {
    title: 'Renegotiate?',
    subtitle:
      'This is a list of what to renegotiate, not who to pay. Your phase decides the payment order.',
    se_libera_sola: {
      label: 'It frees itself',
      message: (months: number, monthlyPayment: string) =>
        `In ${months} ${months === 1 ? 'month' : 'months'} this debt ends and gives you back ${monthlyPayment} per month.`,
    },
    renegocia_esta: {
      label: 'Renegotiate this one',
      message: (balance: string) =>
        `Freeing this payment by paying it off would cost you ${balance}. Refinancing or renegotiating gives you air without spending capital.`,
    },
    te_esta_apretando: {
      label: 'This one is squeezing you',
      message: () =>
        'You pay a lot each month relative to what you owe. A candidate for consolidation or renegotiation.',
    },
    promo: {
      label: 'Watch the date',
      message: (daysLeft: number) =>
        `Your 0% promotion ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. If there is a balance left, many issuers charge all the deferred interest from day one, all at once.`,
    },
  },

  oxygenPanel: {
    title: 'Oxygen Panel',
    header: 'Paying debt is lever number six, not lever number one. Start at the top.',
    subtitle:
      'Sorted by how fast they work, not by how comfortable they are. Check off the ones you tried and write down what they told you.',
    speedLabel: 'Speed',
    whoToCall: 'Who to call',
    whatToSay: 'What to say',
    heads: 'Before you accept',
    registerResult: 'Log your result',
    resultPlaceholder: 'E.g. asked for 19.99%, got 21.99%',
    gainLabel: 'Air you gained',
    gainHelp: 'How much your month goes down (or your income goes up) thanks to this lever.',
    airGained: (perMonth: string, perYear: string) =>
      `You got back ${perMonth} per month. Forever. That is ${perYear} a year you no longer owe anyone.`,
    projectedIpd: 'Your DPI with this air',
    projectionNote:
      'This is a projection until you update your real numbers. When you change the minimum payment or the expense on your dashboard, the DPI moves for real.',
    status: {
      pendiente: 'Pending',
      en_proceso: 'In progress',
      lograda: 'Done',
      no_aplica: 'Does not apply',
    },
  },

  levers: {
    bajar_apr: {
      name: 'Lower the APR',
      what: 'Call and ask for a lower rate. It lowers the interest and the minimum with it.',
      speed: 'This month',
      whoToCall:
        'The customer service number on the back of your card. Ask to be transferred to the retention department.',
      whatToSay: [
        'I have been with you for a while and I have paid. I want to stay, but my ___% APR no longer works for me.',
        'I am comparing balance transfer offers. What rate can you offer me so I do not move my account?',
        'If the answer is no: how long before I can ask again?',
      ],
      heads: 'A no today is not a no three months from now. Write down the date and call back.',
    },
    programa_dificultad: {
      name: 'Hardship program',
      what: 'Almost every issuer has one. They do not advertise it. You have to ask.',
      speed: 'This month',
      whoToCall:
        'The same number for your card or lender. Ask for the financial hardship program.',
      whatToSay: [
        'I am going through a hard stretch and I want to keep paying, not stop paying.',
        'What hardship program do you have and what do I need to qualify?',
        'Does it lower my rate, my payment, or both, and for how many months?',
      ],
      heads:
        'Before you accept, ask whether they close or freeze the account and how it gets reported to the bureaus. It is usually worth it, but it is better to know up front.',
    },
    refinanciar_auto: {
      name: 'Refinance the car',
      what: 'Usually the biggest payment and the easiest one to lower.',
      speed: '30–60 days',
      whoToCall:
        'A local credit union first: they almost always beat the dealer. Get quotes from two or three.',
      whatToSay: [
        'I owe ___ on my car, my rate is ___% and I have ___ payments left.',
        'What rate and monthly payment can you offer me to refinance?',
        'Does the quote affect my credit, or is it a soft pull?',
      ],
      heads:
        'Stretching the term lowers the payment but raises the total interest: it is air today paid for with tomorrow’s money. In the Oxygen phase it can be worth it; decide knowing that.',
    },
    ingreso_extra: {
      name: 'Extra income',
      what: 'Hours, a gig, something to sell. It does not have to be forever.',
      speed: '30 days',
      whoToCall:
        'This is not a call, it is a decision: extra hours where you already work, a weekend gig, or selling what you do not use.',
      whatToSay: [
        'Start with what you already have: extra hours where they already know you is the fastest and the safest.',
        'Selling what you do not use is a one-time hit; a gig is repeat cash flow. Both count.',
        'Give it an end date. A temporary push holds; an open-ended one gets abandoned.',
      ],
      heads:
        'Every extra dollar goes straight to your Oxygen Goal, not to spending. If it mixes with the everyday account, it disappears.',
    },
    recortar_esenciales: {
      name: 'Cut essentials',
      what: 'Insurance, phone, internet, sharing rent.',
      speed: '30–60 days',
      whoToCall:
        'Your insurer (and two more to compare), your phone and internet company, and whoever you rent from.',
      whatToSay: [
        'Car insurance: get three quotes the same day. It is the biggest cut and the least painful.',
        'Phone and internet: ask for retention and compare against a prepaid plan.',
        'Remittances: if you are in deficit, talk to your family and explain that for 3 to 6 months you will send a little less in order to stabilize. That is not abandonment, it is strategy. Switch transfer services too, and turn weekly sends into biweekly ones: the fees drop a lot.',
      ],
      heads:
        'Cutting essentials is not cutting your life. It is the same services at a better price, not less food.',
    },
    liquidar_deuda: {
      name: 'Pay off a debt',
      what: 'It frees its minimum payment, forever.',
      speed: 'Months',
      whoToCall:
        'No one. This one is yours: every extra dollar of the month on a single debt until you cross it off.',
      whatToSay: [
        'Minimum on everything, all the extra on ONE. Spreading it around feels productive and moves nothing.',
        'When you cross it off, its minimum payment does not go back to spending: it goes straight to the next one.',
      ],
      heads:
        'It is the slowest lever and that is why it is number six. It is also the only one that cannot be undone: a payment freed here is yours forever.',
    },
  },

  panel: {
    title: 'Your dashboard',
    yourPhase: 'Your phase',
    ipd: 'Your DPI',
    ipdHelp: 'Debt Pressure Index: (essential expenses + minimum payments) ÷ take-home income.',
    numeroDePaz: 'Your Peace Number',
    numeroDePazHelp: 'The income your month needs, plus a 5% cushion.',
    metaDeOxigeno: 'Your Oxygen Goal',
    metaStage1: 'Stage 1 — cover your month',
    metaStage2: 'Stage 2 — the 5% cushion',
    metaCovered: 'Covered',
    metaCoveredHelp: (min: string, max: string) =>
      `Your income already clears your Peace Number. Fill your lean fund (${min} – ${max} in a HYSA); once it is full, everything goes to the attack.`,
    fondoEsbelto: 'Your lean fund (in a HYSA)',
    dti: 'DTI',
    dtiHelp:
      'The bank’s rule, not ours: debt payments ÷ GROSS income. Do not confuse it with your DPI.',
    dtiMissing: 'Add your gross income to see it',
    freeCashFlow: 'Your free cash flow',
    totalDebt: 'Total debt',
    targetDebt: 'Your target debt',
    targetLocked: 'Your target debt',
    lockedCta: 'Unlock your attack order',
    lockedBody:
      'The Full plan ranks all your debts, gives you your estimated debt-free date, and lets you run scenarios.',
    seeOxygenPanel: 'Open the Oxygen Panel',
    noIncomeCta: 'Add my income',
    singleDebtNote: 'With a single debt there is no order to decide: every extra dollar goes there.',
  },

  debts: {
    title: 'Your debts',
    add: 'Add a debt',
    empty: 'You have not added any debts yet.',
    name: 'Name',
    namePlaceholder: 'E.g. Blue Visa',
    type: 'Debt type',
    typeHelp: 'It changes how your minimum payment behaves month to month.',
    typeOptions: {
      tarjeta: 'Credit card',
      prestamo_plazo: 'Installment loan (auto, personal, student)',
      otro: 'Other',
    },
    balance: 'Balance',
    minPayment: 'Minimum payment',
    estimateMin: 'I do not know — estimate it',
    estimatedNote:
      'Estimated with the formula from the book (1% of the balance + this month’s interest, minimum $25). Correct it if your statement says otherwise.',
    estimateOnlyCards:
      'Installment loans are not estimated: your payment is fixed and it is in your contract.',
    apr: 'APR (%)',
    creditLimit: 'Credit limit (optional)',
    statementDay: 'Statement day (optional)',
    dueDay: 'Due day (optional)',
    promoZero: 'It is on a 0% promotion',
    promoEnd: 'When does the promotion end?',
    employmentTied: 'This is a 401(k) loan or otherwise tied to my job',
    employmentTiedHelp:
      'If you leave the job, this debt becomes due immediately, and whatever you cannot cover counts as an early withdrawal: taxes plus a 10% penalty. That is why it moves up.',
    roi: 'Cash Flow ROI',
    roiHelp:
      'How much monthly payment this debt gives back per dollar of balance. It decides what to renegotiate, not who to pay.',
    payback: 'Payback',
    monthlyInterest: 'Interest this month',
    delete: 'Delete',
    deleteConfirm: 'Delete this debt? This cannot be undone.',
  },

  onboarding: {
    incomeTitle: 'Your income',
    netIncome: 'Monthly take-home income',
    netIncomeHelp: 'What is left after taxes and deductions: what actually reaches you.',
    grossIncome: 'Monthly gross income (optional)',
    grossIncomeHelp: 'We only use it for the DTI, which is the bank’s rule.',
    expensesTitle: 'Your essential expenses',
    expensesHelp:
      'Essentials only: what you cannot skip this month. Non-essential spending does not go into the DPI.',
    expenseFields: {
      vivienda: 'Housing',
      transporte: 'Transportation',
      comida: 'Food',
      servicios: 'Utilities',
      seguros: 'Insurance',
      cuidado_hijos: 'Childcare',
      remesas: 'Remittances',
      otros: 'Other',
    },
    expensesTotal: 'Or just write the total',
    debtsTitle: 'Your debts',
    finish: 'See my diagnosis',
    timePromise: 'Your rescue plan in 15 minutes',
    steps: {
      progress: (step: number, total: number) => `Step ${step} of ${total}`,
      resume: 'You already have saved data — review it and pick up where you left off.',
      back: 'Back',
      continue: 'Continue',
      incomeQuestion: 'How much comes into your home each month?',
      incomeIntro:
        'Your monthly take-home income: what actually reaches your pocket after taxes, across all your jobs. No blame, no judgment — just the number.',
      expensesQuestion: 'Your essential expenses this month',
      expensesIntro:
        'Only what you need to live. Wants and subscriptions do not go here: they are not part of the DPI.',
      simpleMode: 'I would rather enter a single total',
      totalEssential: 'Essential total',
      debtsQuestion: 'Now your debts — one at a time',
      debtsIntro:
        'Have your statements handy. There is no blame here, only strategy: every debt you write down is a debt that stops being invisible.',
      addThisDebt: 'Add this debt',
      addAnother: 'Add another debt',
      noDebts: 'I have no debts',
      calcIpd: (n: number) => `Calculate my DPI (${n} ${n === 1 ? 'debt' : 'debts'})`,
      seePanel: 'See my full dashboard',
    },
  },

  auth: {
    title: 'Sign in with your email',
    intro: 'Create your free account or go back to your dashboard. All you need is your email — no passwords.',
    emailLabel: 'Your email',
    submit: 'Send me the link',
    sending: 'Sending…',
    sentTitle: 'Check your email',
    sentBody: 'We sent you a magic link to sign in. Open it on this same device.',
    sentSpam: 'Not there? Check your spam or promotions folder.',
    expired: 'That link already expired. Ask for a new one below.',
    invalidEmail: 'Enter a valid email',
  },

  landing: {
    badge: 'The official tool of the book',
    lead: 'Stop walking blind. Calculate your Debt Pressure Index (DPI) and get your exact strategy —',
    leadStrong: 'your rescue plan in 15 minutes',
    leadEnd: ', free.',
    cta: 'Calculate my DPI, free',
    ctaNote: 'All you need is your email. No card, no passwords.',
    gaugeExample: (phase: string) => `Example: DPI 0.62 → ${phase} phase`,
    howTitle: 'There is no blame here, only strategy',
    steps: [
      {
        title: '15 minutes, 3 numbers',
        desc: 'Your income, your essential expenses, and your debts. Nothing else.',
      },
      {
        title: 'Your DPI and your phase',
        desc: 'The gauge tells you how much pressure your month is carrying — no blame, just strategy.',
      },
      {
        title: 'Your Oxygen Panel',
        desc: 'The six levers to get air back this month, with what to say and who to call.',
      },
    ],
    phasesTitle: 'Your phase decides your strategy',
    phasesIntro:
      'The same selector from the book: your DPI places you in a phase, and each phase has its play.',
    phaseCards: {
      DEFICIT: { range: 'DPI above 1.00', play: 'Surplus + highest Cash Flow ROI' },
      OXIGENO: { range: 'DPI 0.70 or higher', play: 'Highest Cash Flow ROI first' },
      BOLA_DE_NIEVE: { range: 'DPI 0.45 to 0.70', play: 'Smallest balance first' },
      AVALANCHA: { range: 'DPI below 0.45', play: 'Highest APR first' },
    },
    finalTitle: 'Your first victory is 15 minutes away',
    finalBody:
      'A thousand numbers in your head turn into one clear plan. Start free today.',
    finalCta: 'Start my diagnosis',
    bookNote: 'Do not have the book yet?',
    bookLink: 'Get it here',
  },

  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthYear: (month: string, year: number) => `${month} ${year}`,
};
