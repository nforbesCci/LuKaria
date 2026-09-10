/** UWI FORM LRF01 page-1 test catalog (checkbox keys = display labels). */

export const LRF01_HAEMATOLOGY = {
  routine: ['CBC', 'RETIC', 'ESR', 'Inf. Mono.', 'CSF/Fluid', 'Hb Electrophoresis'],
  coagulation: [
    'PT',
    'PTT',
    'INR',
    'Fibrinogen',
    'Thrombin Time',
    'Mixing Studies',
    'Bleeding Time',
    'Lupus Anticoagulant',
    'Ristocetin',
    'Platelet Aggregation',
    'FDP',
  ],
  factorAssay: ['VIII', 'IX', 'XI'],
  special: ['HbA2', "Ham's", 'LAP Score', 'Osmotic Fragility', 'Urine Haemosiderin'],
};

export const LRF01_CHEMISTRY = {
  electrolytes: ['Na', 'K', 'Cl', 'HCO3', 'Urea', 'Creatinine', 'Phosphorus', 'Calcium', 'Uric Acid', 'Magnesium'],
  bloodSugar: ['Random', 'Fasting', '2 h. PPG', 'OGTT', 'HbA1c'],
  tumorMarkers: ['AFP', 'CA-125', 'CEA', 'CA-15-3', 'Total PSA'],
  serumLipids: [
    'Total Protein',
    'Albumin',
    'Globulin',
    'Total Cholesterol',
    'LDL',
    'HDL',
    'Triglyceride',
    'Protein Electrophoresis',
    'Lipoprotein Electrophoresis',
  ],
  urine: [
    'Na',
    'Urinalysis',
    'K',
    'Microscopy',
    'Urea',
    'VMA',
    'Creatinine',
    'Uric Acid',
    'Creatinine Clearance',
    'Calcium',
    'Phosphorus',
    'Protein',
    'Protein Electrophoresis',
    'Cortisol',
    'Microalbumin',
  ],
  hormones: [
    'FSH',
    'TSH',
    'FT3',
    'DHEA-S',
    'FT4',
    'Cortisol',
    'ACTH',
    'Prolactin',
    'LH',
    'βHCG',
    'Oestradiol',
    '17-KS',
    '17-KGS',
    'Progesterone',
    'Testosterone',
    'Growth hormone',
  ],
  cardiacLiver: ['CPK', 'ALT', 'Bili D', 'Troponin I', 'AST', 'Bili T', 'LDH', 'Alk. Phos', 'GGTP'],
  other: [
    'Amylase',
    'Insulin (F)',
    'CSF Glucose',
    'Vit.B12/Fol. Acid',
    'Serum Iron/TIBC',
    'PTH',
    'Ferritin',
    'Lithium',
    'CSF Protein',
    'β2-Microglobulin',
    'Salicylate',
    'Lipase',
    'Digoxin',
    'C-peptide',
    'Dilantin',
    'Other',
  ],
};

export const LRF01_BLOOD_BANK = ['Group & Rh', 'Direct Coombs', 'Antibody ID', 'Indirect Coombs'];

export const LRF01_IMMUNOLOGY = {
  serology: ['VDRL', 'FTA', 'Widal', 'ASTO', 'Brucella'],
  autoantibodies: [
    'RF',
    'ANA',
    'ENA',
    'Anti-CCP',
    'Thyroglobulin',
    'ANCA',
    'Cardiolipin',
    'Anti-β2GPI',
    'Mitochondrial',
    'Gastric Parietal Cell',
    'dsDNA',
    'Smooth Muscle',
  ],
  serumProtein: ['C3', 'C4', 'CRP', 'IgA', 'IgG', 'IgM'],
  lymphocyte: [
    'Viral load',
    'T lymphocytes',
    'CD4',
    'B-lymphocyte (CD19/20)',
    'CD8',
    'NK-lymphocyte (CD38/56)',
  ],
  other: ['H. pylori (urea breath)'],
};

export const LRF01_VIROLOGY = {
  feverRash: ['Dengue', 'Rubella', 'Measles', 'Varicella', 'Parvovirus'],
  hepatitis: ['HBsAg', 'HBeAg', 'Anti-HAV', 'Anti-HCV', 'Anti-HB core', 'Anti-HBsAg'],
  otherTests: ['CMV', 'Mumps', 'EBV', 'Influenza', 'TORCH', 'Viral Culture', 'HTLV', 'Western Blot'],
  vaccine: ['MMR', 'Varicella', 'Anti-HBsAg'],
  sti: ['HSV 1', 'HIV', 'HSV 2', 'Stool Rotavirus', 'Chlamydia', 'Toxoplasma gondi'],
};

export const LRF01_VIROLOGY_GRID = ['Chlamydia', 'Dengue Virus', 'HCV', 'HIV', 'Mycobact'];
export const LRF01_VIROLOGY_GRID_COLS = ['Genotyping', 'Resistance', 'Viral Load', 'PCR'];

export const LRF01_BACTERIOLOGY = {
  microscopy: ['Gram stain', 'AFB/ZN', 'India Ink'],
  toxin: ['C.difficile'],
  culture: ['Culture and Sensitivity'],
};

export const LRF01_PARASITOLOGY = [
  'Ova and Parasites (O & P)',
  'E. histolytica',
  'Malaria',
  'Cryptosporidia',
  'Giardia',
  'Toxocara',
  'Filariasis',
];

export const LRF01_MYCOLOGY = [
  'Fungal Culture',
  'Environmental',
  'KOH',
  'Fungal ID (Isolate)',
  'Cryptococcal Antigen',
  'Calcofluor white',
];

export const LRF01_PHLEB_TUBES = [
  'LAVENDER',
  'RED',
  'GREY',
  'BLUE',
  'O2 Aerobic',
  'ANO2 An-aerobic',
  'PED5 Paediatric',
  "STUART'S",
  'OTHER',
];

export function mapFromKeys(keys, initial = false) {
  return Object.fromEntries(keys.map((k) => [k, initial]));
}

export function mapNested(groups, initial = false) {
  const out = {};
  Object.entries(groups).forEach(([section, keys]) => {
    out[section] = mapFromKeys(keys, initial);
  });
  return out;
}

export function parsePatientName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { surname: '', firstName: '', middleName: '' };
  if (parts.length === 1) return { surname: parts[0], firstName: '', middleName: '' };
  if (parts.length === 2) return { firstName: parts[0], middleName: '', surname: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    surname: parts[parts.length - 1],
  };
}

/** Weight-loss quick select subset on LRF01 keys. */
export function applyWeightLossSelections(state) {
  const next = structuredClone(state);
  const mark = (bucket, keys) => {
    keys.forEach((k) => {
      if (next[bucket] && Object.prototype.hasOwnProperty.call(next[bucket], k)) {
        next[bucket][k] = true;
      }
    });
  };
  mark('chemistryElectrolytes', ['Urea', 'Creatinine']);
  mark('chemistryBloodSugar', ['HbA1c']);
  mark('chemistrySerumLipids', ['Total Cholesterol', 'LDL', 'HDL', 'Triglyceride']);
  mark('chemistryCardiacLiver', ['ALT', 'AST', 'Alk. Phos']);
  return next;
}
