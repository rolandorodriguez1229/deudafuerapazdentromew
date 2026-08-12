// Todo el copy del GPS Anti-Deuda en español. Es la fuente: `en.ts` debe
// implementar exactamente estas mismas llaves (TypeScript lo verifica).
//
// Reglas del libro, no negociables:
//   · Nunca "TAE" — siempre APR. Nunca "money market" — siempre HYSA.
//   · Nunca lenguaje de culpa, ni signos de exclamación en las alertas.
//   · El IPD siempre en decimal (0.89, nunca 89%).
//   · Las cuatro fases son Déficit, Oxígeno, Bola de Nieve y Avalancha.
//     El ROI de Flujo ordena en Déficit y Oxígeno; saldo menor en Bola de
//     Nieve; APR más alta en Avalancha.

import type { AttackReason, LeverId, OrderStrategy, Phase } from '../types';

export const es = {
  disclaimer:
    'Herramienta educativa e informativa; no constituye asesoría financiera, legal ni fiscal.',
  disclaimerRegulatorio:
    'Esta herramienta no gestiona, negocia ni liquida deudas por ti, no recibe ni administra pagos, y no es un servicio de manejo o alivio de deuda.',

  common: {
    noBlame: 'Aquí no hay culpa, hay estrategia.',
    firstVictory: 'Acabas de lograr tu primera victoria: ya no caminas a ciegas.',
    bankTrap: 'El banco aprueba deudas que tu vida no puede pagar.',
    estimate: 'Estimado',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    saving: 'Guardando…',
    perMonth: 'al mes',
    months: 'meses',
    of: 'de',
    langLabel: 'Idioma',
  },

  nav: {
    panel: 'Tu panel',
    oxigeno: 'Panel de Oxígeno',
    deudas: 'Tus deudas',
    escenarios: 'Escenarios',
    cuenta: 'Tu cuenta',
    signOut: 'Cerrar sesión',
  },

  phase: {
    SIN_DEUDAS: {
      name: 'Sin deudas',
      headline: 'Vives sin deudas.',
      message:
        'Tu siguiente paso es el fondo esbelto: de 0.5 a 2 meses de gastos esenciales en una HYSA. Lleno el fondo, cada dólar que liberes es tuyo.',
      color: 'verde',
    },
    SIN_INGRESO: {
      name: 'Sin ingreso registrado',
      headline: 'Todavía no podemos calcular tu IPD.',
      message:
        'El IPD divide entre tu ingreso neto mensual, así que necesitamos ese número para darte tu fase. Si tu ingreso hoy es cero, empieza por el Panel de Oxígeno: la palanca de ingreso extra es la que aplica.',
      color: 'rojo',
    },
    DEFICIT: {
      name: 'Déficit',
      headline: 'Estás en la posición más crítica: cada dólar tiene que comprar aire.',
      message:
        'Tu mes cuesta más de lo que entra, así que tu primer trabajo es generar superávit. Y todo lo que consigas —un gig, una venta, un recorte— va a la deuda que más pago mensual te devuelva por cada dólar invertido. Ese es tu ROI de Flujo.',
      color: 'rojo',
    },
    OXIGENO: {
      name: 'Oxígeno',
      headline: 'Tu prioridad es recuperar aire con el menor capital posible.',
      message:
        'Tus pagos mínimos te están ahogando. Ataca la deuda con el ROI de Flujo más alto: la que más pago mensual libera por cada dólar que necesitas para liquidarla. Cada pago que se libera aquí se queda contigo para siempre.',
      color: 'rojo',
    },
    BOLA_DE_NIEVE: {
      name: 'Bola de Nieve',
      headline: 'Ya respiras. Ahora gana impulso.',
      message:
        'Tienes aire en el mes. Concentra todo tu excedente en la deuda de saldo menor: cada cuenta que tachas libera su pago mínimo y alimenta a la siguiente.',
      color: 'amarillo',
    },
    AVALANCHA: {
      name: 'Avalancha',
      headline: 'Tu flujo es sólido. Ahora baja el costo.',
      message:
        'Ya no estás peleando por sobrevivir el mes, así que conviene minimizar lo que le regalas al banco: ataca primero el APR más alto.',
      color: 'verde',
    },
  } satisfies Record<Phase, { name: string; headline: string; message: string; color: string }>,

  orderStrategy: {
    roi_flujo: 'Mayor ROI de Flujo primero — la que más pago libera por dólar',
    saldo_menor: 'Saldo menor primero (Bola de Nieve)',
    apr_mas_alta: 'APR más alta primero (Avalancha)',
  } satisfies Record<OrderStrategy, string>,

  attackReason: {
    fuga_eterna: 'Fuga eterna: el mínimo no reduce capital y la llamada no dio resultado',
    atada_al_empleo: 'Atada a tu empleo — se salda antes de pasar a optimizar intereses',
    fase: 'Orden de tu fase',
  } satisfies Record<AttackReason, string>,

  utilization: {
    label: 'Utilización',
    ideal: 'Ideal (menos de 9%)',
    aceptable: 'Aceptable (menos de 30%)',
    alta: 'Alta',
    critica: 'Crítica (arriba de 80%)',
  },

  alerts: {
    fugaEterna:
      'Este mínimo no reduce tu deuda ni un dólar — esta cuenta crece aunque pagues.',
    fugaEternaLlamar:
      'A este nivel no puedes ganarle abonando: le metes menos de lo que genera de interés cada mes. Llama y pide una APR menor o un plan de dificultad. Es la primera llamada que tienes que hacer.',
    fugaEternaPrimero:
      'Si ya llamaste y no te ayudaron, esta va primero: mientras siga así, crece cada mes que pasa.',
    stuckProjection:
      'Con los pagos actuales, esta deuda nunca baja: el mínimo no cubre ni los intereses.',
    concentracion: 'Repartir se siente productivo y no mueve nada. Concentra.',
    concentracionRegla:
      'Mínimo a todas, todo el extra a UNA sola deuda. Esta es la tuya.',
    balanceOverLimit: 'Tu saldo pasa tu límite de crédito. Verifica el dato.',
    minOverBalance: 'Tu pago mínimo es mayor que tu saldo. Esta deuda se cierra este mes.',
  },

  renegotiate: {
    title: '¿Renegociar?',
    subtitle:
      'Esto es una lista de qué renegociar, no de a quién pagar. El orden de pago lo decide tu fase.',
    se_libera_sola: {
      label: 'Se libera sola',
      message: (months: number, monthlyPayment: string) =>
        `En ${months} ${months === 1 ? 'mes' : 'meses'} esta deuda termina y te devuelve ${monthlyPayment} al mes.`,
    },
    renegocia_esta: {
      label: 'Renegocia esta',
      message: (balance: string) =>
        `Liberar este pago abonando te costaría ${balance}. Refinanciarla o renegociarla te da aire sin gastar capital.`,
    },
    te_esta_apretando: {
      label: 'Te está apretando',
      message: () =>
        'Pagas mucho al mes en relación con lo que debes. Candidata a consolidación o renegociación.',
    },
    promo: {
      label: 'Ojo con la fecha',
      message: (daysLeft: number) =>
        `Tu promoción de 0% termina en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}. Si queda saldo, muchos emisores cobran de golpe todo el interés diferido desde el día uno.`,
    },
  },

  oxygenPanel: {
    title: 'Panel de Oxígeno',
    header: 'Pagar deuda es la palanca número seis, no la número uno. Empieza por arriba.',
    subtitle:
      'Ordenadas por velocidad de resultado, no por comodidad. Marca la que ya intentaste y anota qué te dijeron.',
    speedLabel: 'Velocidad',
    whoToCall: 'A quién llamar',
    whatToSay: 'Qué decir',
    heads: 'Antes de aceptar',
    registerResult: 'Registra tu resultado',
    resultPlaceholder: 'Ej. pedí 19.99%, me dieron 21.99%',
    gainLabel: 'Aire que ganaste',
    gainHelp: 'Cuánto baja tu mes (o cuánto sube tu ingreso) gracias a esta palanca.',
    airGained: (perMonth: string, perYear: string) =>
      `Recuperaste ${perMonth} al mes. Para siempre. Eso son ${perYear} al año que ya no le debes a nadie.`,
    projectedIpd: 'Tu IPD con este aire',
    projectionNote:
      'Es una proyección hasta que actualices tus números reales. Cuando cambies el pago mínimo o el gasto en tu tablero, el IPD se mueve de verdad.',
    status: {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      lograda: 'Lograda',
      no_aplica: 'No aplica',
    },
  },

  levers: {
    bajar_apr: {
      name: 'Bajar la APR',
      what: 'Llamar y pedir una tasa menor. Baja el interés y con él el mínimo.',
      speed: 'Este mes',
      whoToCall:
        'El número de servicio al cliente que viene atrás de tu tarjeta. Pide que te pasen al departamento de retención.',
      whatToSay: [
        'Llevo tiempo con ustedes y he pagado. Quiero quedarme, pero mi APR de ___% ya no me funciona.',
        'Estoy comparando ofertas de transferencia de saldo. ¿Qué tasa me pueden ofrecer para que no mueva mi cuenta?',
        'Si la respuesta es no: ¿en cuánto tiempo puedo volver a pedirlo?',
      ],
      heads: 'Un "no" de hoy no es un "no" de aquí a tres meses. Anota la fecha y vuelve a llamar.',
    },
    programa_dificultad: {
      name: 'Programa de dificultad',
      what: 'Casi todos los emisores tienen uno. No lo anuncian. Hay que pedirlo.',
      speed: 'Este mes',
      whoToCall:
        'El mismo número de tu tarjeta o prestamista. Pide el programa de dificultad financiera (hardship program).',
      whatToSay: [
        'Estoy pasando por una situación difícil y quiero seguir pagando, no dejar de pagar.',
        '¿Qué programa de dificultad tienen y qué necesito para calificar?',
        '¿Baja mi tasa, baja mi pago, o las dos cosas, y por cuántos meses?',
      ],
      heads:
        'Pregunta antes de aceptar si cierran o congelan la cuenta y cómo se reporta al buró. Vale la pena, pero conviene saberlo de antemano.',
    },
    refinanciar_auto: {
      name: 'Refinanciar el auto',
      what: 'Suele ser el pago más grande y el más fácil de bajar.',
      speed: '30–60 días',
      whoToCall:
        'Una credit union local primero: casi siempre dan mejor tasa que el dealer. Pide cotización en dos o tres.',
      whatToSay: [
        'Debo ___ de mi carro, mi tasa es ___% y me faltan ___ pagos.',
        '¿Qué tasa y qué pago mensual me pueden ofrecer para refinanciar?',
        '¿La cotización afecta mi crédito o es una consulta suave?',
      ],
      heads:
        'Alargar el plazo baja el pago pero sube el interés total: es oxígeno de hoy pagado con dinero de mañana. En fase Oxígeno puede valer la pena; decídelo sabiéndolo.',
    },
    ingreso_extra: {
      name: 'Ingreso extra',
      what: 'Horas, gig, algo que vender. No tiene que ser para siempre.',
      speed: '30 días',
      whoToCall:
        'Esta no es una llamada, es una decisión: horas extra donde ya trabajas, un gig de fin de semana, o vender lo que no usas.',
      whatToSay: [
        'Empieza por lo que ya tienes: horas extra donde ya te conocen es lo más rápido y lo más seguro.',
        'Vender lo que no usas da un golpe único; el gig da flujo repetido. Los dos cuentan.',
        'Ponle fecha de fin. Un esfuerzo temporal se sostiene; uno sin fecha se abandona.',
      ],
      heads:
        'Todo lo extra va completo a tu Meta de Oxígeno, no al gasto. Si se mezcla con la cuenta del diario, desaparece.',
    },
    recortar_esenciales: {
      name: 'Recortar esenciales',
      what: 'Seguro, teléfono, internet, renta compartida.',
      speed: '30–60 días',
      whoToCall:
        'Tu aseguradora (y dos más para comparar), tu compañía de teléfono e internet, y quien te renta.',
      whatToSay: [
        'Seguro de auto: cotiza en tres lugares el mismo día. Es el recorte más grande y el menos doloroso.',
        'Teléfono e internet: pide retención y compara con un plan prepagado.',
        'Remesas: si estás en déficit, habla con tu familia y explica que por 3 a 6 meses vas a enviar un poco menos para estabilizarte. No es abandono, es estrategia. Cambia también de servicio de envío y junta envíos semanales en quincenales: la comisión baja mucho.',
      ],
      heads:
        'Recortar esenciales no es recortar tu vida. Son los mismos servicios a mejor precio, no menos comida.',
    },
    liquidar_deuda: {
      name: 'Liquidar una deuda',
      what: 'Libera su pago mínimo, para siempre.',
      speed: 'Meses',
      whoToCall:
        'Nadie. Esta es tuya: todo el excedente del mes a una sola deuda hasta tacharla.',
      whatToSay: [
        'Mínimo a todas, todo el extra a UNA. Repartir se siente productivo y no mueve nada.',
        'Cuando la taches, su pago mínimo no vuelve al gasto: pasa completo a la siguiente.',
      ],
      heads:
        'Es la palanca más lenta y por eso es la número seis. Es también la única que no se puede revertir: un pago liberado aquí es tuyo para siempre.',
    },
  } satisfies Record<
    LeverId,
    {
      name: string;
      what: string;
      speed: string;
      whoToCall: string;
      whatToSay: string[];
      heads: string;
    }
  >,

  panel: {
    title: 'Tu panel',
    yourPhase: 'Tu fase',
    ipd: 'Tu IPD',
    ipdHelp: 'Índice de Presión de Deuda: (gastos esenciales + pagos mínimos) ÷ ingreso neto.',
    numeroDePaz: 'Tu Número de Paz',
    numeroDePazHelp: 'El ingreso que tu mes necesita, más un colchón del 5%.',
    metaDeOxigeno: 'Tu Meta de Oxígeno',
    metaStage1: 'Etapa 1 — cubrir tu mes',
    metaStage2: 'Etapa 2 — el colchón del 5%',
    metaCovered: 'Cubierta',
    metaCoveredHelp: (min: string, max: string) =>
      `Tu ingreso ya supera tu Número de Paz. Llena tu fondo esbelto (${min} – ${max} en una HYSA); lleno, todo va al ataque.`,
    fondoEsbelto: 'Tu fondo esbelto (en HYSA)',
    dti: 'DTI',
    dtiHelp:
      'Regla del banco, no nuestra: pagos de deuda ÷ ingreso BRUTO. No la confundas con tu IPD.',
    dtiMissing: 'Agrega tu ingreso bruto para verlo',
    freeCashFlow: 'Tu flujo libre',
    totalDebt: 'Deuda total',
    targetDebt: 'Tu deuda objetivo',
    targetLocked: 'Tu deuda objetivo',
    lockedCta: 'Desbloquea tu orden de ataque',
    lockedBody:
      'El plan Full te ordena todas tus deudas, te da tu fecha estimada de deuda cero y te deja probar escenarios.',
    seeOxygenPanel: 'Ver el Panel de Oxígeno',
    noIncomeCta: 'Registrar mi ingreso',
    singleDebtNote:
      'Con una sola deuda no hay orden que decidir: todo el excedente va ahí.',
  },

  debts: {
    title: 'Tus deudas',
    add: 'Agregar deuda',
    empty: 'Todavía no registras ninguna deuda.',
    name: 'Nombre',
    namePlaceholder: 'Ej. Visa azul',
    type: 'Tipo de deuda',
    typeHelp: 'Cambia cómo se comporta tu pago mínimo mes a mes.',
    typeOptions: {
      tarjeta: 'Tarjeta de crédito',
      prestamo_plazo: 'Préstamo a plazo (auto, personal, estudiantil)',
      otro: 'Otro',
    },
    balance: 'Saldo',
    minPayment: 'Pago mínimo',
    estimateMin: 'No lo sé — estímalo',
    estimatedNote:
      'Estimado con la fórmula del libro (1% del saldo + el interés del mes, mínimo $25). Corrígelo si tu estado de cuenta dice otra cosa.',
    estimateOnlyCards:
      'En préstamos a plazo no se estima: tu pago es fijo y viene en tu contrato.',
    apr: 'APR (%)',
    creditLimit: 'Límite de crédito (opcional)',
    statementDay: 'Día de corte (opcional)',
    dueDay: 'Día de pago (opcional)',
    promoZero: 'Está en promoción de 0%',
    promoEnd: '¿Cuándo termina la promoción?',
    employmentTied: 'Es un préstamo de mi 401k o está atado a mi empleo',
    employmentTiedHelp:
      'Si dejas el trabajo, esta deuda se vuelve pagadera de inmediato, y lo que no cubras cuenta como retiro anticipado: impuestos más 10% de multa. Por eso sube de prioridad.',
    roi: 'ROI de Flujo',
    roiHelp:
      'Cuánto pago mensual te devuelve esta deuda por cada dólar de saldo. Sirve para decidir qué renegociar, no a quién pagar.',
    payback: 'Payback',
    monthlyInterest: 'Interés del mes',
    delete: 'Eliminar',
    deleteConfirm: '¿Eliminar esta deuda? No se puede deshacer.',
  },

  onboarding: {
    incomeTitle: 'Tu ingreso',
    netIncome: 'Ingreso neto mensual',
    netIncomeHelp: 'Lo que te queda después de impuestos y descuentos: lo que de verdad te llega.',
    grossIncome: 'Ingreso bruto mensual (opcional)',
    grossIncomeHelp: 'Solo lo usamos para el DTI, que es la regla del banco.',
    expensesTitle: 'Tus gastos esenciales',
    expensesHelp:
      'Solo lo esencial: lo que no puedes dejar de pagar este mes. Los gastos no esenciales no entran en el IPD.',
    expenseFields: {
      vivienda: 'Vivienda',
      transporte: 'Transporte',
      comida: 'Comida',
      servicios: 'Servicios',
      seguros: 'Seguros',
      cuidado_hijos: 'Cuidado de hijos',
      remesas: 'Remesas',
      otros: 'Otros',
    },
    expensesTotal: 'O escribe solo el total',
    debtsTitle: 'Tus deudas',
    finish: 'Ver mi diagnóstico',
    timePromise: 'Tu plan de rescate en 15 minutos',
    steps: {
      progress: (step: number, total: number) => `Paso ${step} de ${total}`,
      resume: 'Ya tienes datos guardados — puedes revisarlos y continuar donde te quedaste.',
      back: 'Atrás',
      continue: 'Continuar',
      incomeQuestion: '¿Cuánto entra a tu casa cada mes?',
      incomeIntro:
        'Tu ingreso neto mensual: lo que de verdad llega a tu bolsillo después de impuestos, sumando todos tus trabajos. Sin culpa, sin juicio — solo el número.',
      expensesQuestion: 'Tus gastos esenciales del mes',
      expensesIntro:
        'Solo lo necesario para vivir. Los gustos y las suscripciones no van aquí: no entran en el cálculo del IPD.',
      simpleMode: 'Prefiero poner un solo total',
      totalEssential: 'Total esencial',
      debtsQuestion: 'Ahora, tus deudas — una por una',
      debtsIntro:
        'Ten a la mano tus estados de cuenta. Aquí no hay culpa, hay estrategia: cada deuda que anotas es una deuda que deja de ser invisible.',
      addThisDebt: 'Agregar esta deuda',
      addAnother: 'Agregar otra deuda',
      noDebts: 'No tengo deudas',
      calcIpd: (n: number) => `Calcular mi IPD (${n} ${n === 1 ? 'deuda' : 'deudas'})`,
      seePanel: 'Ver mi panel completo',
    },
  },

  auth: {
    title: 'Entra con tu correo',
    intro: 'Crea tu cuenta gratis o vuelve a tu tablero. Solo necesitas tu correo — sin contraseñas.',
    emailLabel: 'Tu correo',
    submit: 'Enviarme el enlace',
    sending: 'Enviando…',
    sentTitle: 'Revisa tu correo',
    sentBody: 'Te enviamos un enlace mágico para entrar. Ábrelo desde este mismo dispositivo.',
    sentSpam: '¿No llega? Revisa tu carpeta de spam o promociones.',
    expired: 'Ese enlace ya expiró. Pide uno nuevo aquí abajo.',
    invalidEmail: 'Escribe un correo válido',
  },

  landing: {
    badge: 'La herramienta oficial del libro',
    lead: 'Deja de caminar a ciegas. Calcula tu Índice de Presión de Deuda (IPD) y recibe tu estrategia exacta —',
    leadStrong: 'tu plan de rescate en 15 minutos',
    leadEnd: ', gratis.',
    cta: 'Calcula tu IPD gratis',
    ctaNote: 'Solo necesitas tu correo. Sin tarjeta, sin contraseñas.',
    gaugeExample: (phase: string) => `Ejemplo: IPD 0.62 → fase ${phase}`,
    howTitle: 'Aquí no hay culpa, hay estrategia',
    steps: [
      {
        title: '15 minutos, 3 números',
        desc: 'Tu ingreso, tus gastos esenciales y tus deudas. Nada más.',
      },
      {
        title: 'Tu IPD y tu fase',
        desc: 'El velocímetro te dice cuánta presión carga tu mes — sin culpa, con estrategia.',
      },
      {
        title: 'Tu Panel de Oxígeno',
        desc: 'Las seis palancas para recuperar aire este mes, con qué decir y a quién llamar.',
      },
    ],
    phasesTitle: 'Tu fase decide tu estrategia',
    phasesIntro: 'El mismo selector del libro: tu IPD te ubica en una fase, y cada fase tiene su jugada.',
    phaseCards: {
      DEFICIT: { range: 'IPD arriba de 1.00', play: 'Superávit + mayor ROI de Flujo' },
      OXIGENO: { range: 'IPD 0.70 o más', play: 'Mayor ROI de Flujo primero' },
      BOLA_DE_NIEVE: { range: 'IPD 0.45 a 0.70', play: 'Saldo menor primero' },
      AVALANCHA: { range: 'IPD abajo de 0.45', play: 'APR más alta primero' },
    },
    finalTitle: 'Tu primera victoria está a 15 minutos',
    finalBody:
      'Miles de números en tu cabeza se convierten en un solo plan claro. Empieza gratis hoy.',
    finalCta: 'Empezar mi diagnóstico',
    bookNote: '¿Aún no tienes el libro?',
    bookLink: 'Consíguelo aquí',
  },

  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthYear: (month: string, year: number) => `${month} de ${year}`,
};

export type Copy = typeof es;
