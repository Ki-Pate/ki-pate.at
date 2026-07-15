export const SCENES = [
  {
    id: 'chaos',
    label: '01 · Chaos',
    problem: 'Montagmorgen, E-Mails, Notizen, Anfragen',
    solution: 'Eingänge werden erkannt und geordnet',
    headline: 'KI, die Arbeit wirklich abnimmt.',
    resultTerms: ['erkannt', 'geordnet'],
  },
  {
    id: 'inbox',
    label: '02 · Posteingang',
    problem: '83 Nachrichten, unklare Priorität',
    solution: 'sortieren, zusammenfassen, Antworten vorbereiten',
    headline: '83 E-Mails. 7 Entscheidungen.',
    resultTerms: ['sortiert', 'zusammengefasst', 'vorbereitet'],
  },
  {
    id: 'offer',
    label: '03 · Angebot',
    problem: 'Anfrage, Anhang, Kunden- und Preisdaten',
    solution: 'Angebotsentwurf und CRM-Eintrag entstehen',
    headline: 'Die Anfrage kommt. Das Angebot wartet schon.',
    resultTerms: ['Angebotsentwurf', 'CRM-Eintrag', 'Freigabe'],
  },
  {
    id: 'meeting',
    label: '04 · Meeting',
    problem: 'Gespräch vorbei, Nacharbeit beginnt',
    solution: 'Entscheidungen, Aufgaben und Termine werden extrahiert',
    headline: 'Das Meeting endet. Die Nacharbeit auch.',
    resultTerms: ['Entscheidungen', 'Aufgaben', 'Termine'],
  },
  {
    id: 'knowledge',
    label: '05 · Wissen',
    problem: 'Information steckt in Dateien und Köpfen',
    solution: 'Antwort erscheint mit überprüfbaren Quellen',
    headline: 'Antworten mit Quelle. Nicht mit Bauchgefühl.',
    resultTerms: ['Antwort', 'Quellen', 'prüfbar'],
  },
  {
    id: 'control',
    label: '06 · Kontrolle',
    problem: 'Sorge vor Blackbox und Datenschutz',
    solution: 'menschliche Freigabe, DSGVO und On-Premise',
    headline: 'Die KI arbeitet. Sie entscheiden.',
    resultTerms: ['Freigabe', 'DSGVO', 'On-Premise'],
  },
];

export const DEMO_ROUTES = [
  {
    slug: 'arbeitsfluss',
    label: 'A',
    title: 'Der stille Arbeitsfluss',
  },
  {
    slug: 'betrieb-im-schnitt',
    label: 'B',
    title: 'Der Betrieb im Schnitt',
  },
  {
    slug: 'use-case-inseln',
    label: 'C',
    title: 'Use-Case-Inseln',
  },
];

export function calculatePotentialHours(hours) {
  if (!Number.isInteger(hours) || hours < 1 || hours > 80) {
    throw new RangeError('Wochenstunden müssen eine ganze Zahl von 1 bis 80 sein.');
  }

  const annualHours = hours * 46;

  return {
    min: Math.round(annualHours * 0.2),
    max: Math.round(annualHours * 0.4),
  };
}
