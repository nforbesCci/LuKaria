import { getDatabase } from './mongodb';

/** Bump when code defaults must replace a previously saved formulary document. */
export const MEDICATION_FORMULARY_VERSION = 3;

export const DEFAULT_FORMULARY = {
  version: MEDICATION_FORMULARY_VERSION,
  medications: [
    { name: 'Mounjaro', doses: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'] },
    {
      name: 'Tirzepatide (generic)',
      doses: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'],
    },
    {
      name: 'Semaglutide (generic)',
      doses: ['0.25 mg', '0.5 mg', '1 mg', '1.5 mg', '2 mg'],
    },
    {
      name: 'Semasize',
      doses: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'],
    },
    {
      name: 'Wegovy',
      doses: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'],
    },
    {
      name: 'Semaglutide (oral)',
      doses: ['3 mg', '7 mg', '14 mg'],
    },
  ],
};

function normalizeMedications(medications) {
  return (Array.isArray(medications) ? medications : [])
    .map((m) => ({
      name: String(m.name || '').trim(),
      doses: Array.isArray(m.doses)
        ? m.doses.map((d) => String(d).trim()).filter(Boolean)
        : [],
    }))
    .filter((m) => m.name);
}

export async function getMedicationFormulary() {
  const db = await getDatabase();
  const doc = await db.collection('medicationFormulary').findOne({ key: 'default' });
  if (!doc?.medications?.length || Number(doc.version) !== MEDICATION_FORMULARY_VERSION) {
    return saveMedicationFormulary(DEFAULT_FORMULARY.medications);
  }
  return {
    version: MEDICATION_FORMULARY_VERSION,
    medications: normalizeMedications(doc.medications),
  };
}

export async function saveMedicationFormulary(medications) {
  const cleaned = normalizeMedications(medications);
  if (!cleaned.length) {
    throw new Error('At least one medication is required');
  }
  const db = await getDatabase();
  await db.collection('medicationFormulary').updateOne(
    { key: 'default' },
    {
      $set: {
        key: 'default',
        version: MEDICATION_FORMULARY_VERSION,
        medications: cleaned,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  return {
    version: MEDICATION_FORMULARY_VERSION,
    medications: cleaned,
  };
}
