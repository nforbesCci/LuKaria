import { getDatabase } from './mongodb';

const DEFAULT_FORMULARY = {
  medications: [
    { name: 'Mounjaro', doses: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'] },
    { name: 'Tirzepatide', doses: ['2.5 mg', '5 mg', '7.5 mg', '10 mg', '12.5 mg', '15 mg'] },
    { name: 'Semaglutide', doses: ['0.25 mg', '0.5 mg', '1 mg', '1.7 mg', '2.4 mg'] },
  ],
};

export async function getMedicationFormulary() {
  const db = await getDatabase();
  const doc = await db.collection('medicationFormulary').findOne({ key: 'default' });
  if (!doc?.medications?.length) {
    return { ...DEFAULT_FORMULARY };
  }
  return {
    medications: doc.medications
      .map((m) => ({
        name: String(m.name || '').trim(),
        doses: Array.isArray(m.doses)
          ? m.doses.map((d) => String(d).trim()).filter(Boolean)
          : [],
      }))
      .filter((m) => m.name),
  };
}

export async function saveMedicationFormulary(medications) {
  const cleaned = (Array.isArray(medications) ? medications : [])
    .map((m) => ({
      name: String(m.name || '').trim(),
      doses: Array.isArray(m.doses)
        ? m.doses.map((d) => String(d).trim()).filter(Boolean)
        : [],
    }))
    .filter((m) => m.name);
  if (!cleaned.length) {
    throw new Error('At least one medication is required');
  }
  const db = await getDatabase();
  await db.collection('medicationFormulary').updateOne(
    { key: 'default' },
    {
      $set: {
        key: 'default',
        medications: cleaned,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  return { medications: cleaned };
}
