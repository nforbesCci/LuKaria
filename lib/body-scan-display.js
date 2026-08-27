/** Shared helpers for body-scan result display (metric ↔ imperial). */

export function toFiniteNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveBodyMassValues(measurement) {
  const m = measurement || {};
  let lean = toFiniteNumber(m.lean_body_mass ?? m.estimated_lean_body_mass);
  let fat = toFiniteNumber(m.fat_body_mass ?? m.estimated_fat_body_mass);
  if (lean == null || fat == null) {
    const weight = toFiniteNumber(m.weight ?? m.estimated_weight);
    const fatPct = toFiniteNumber(m.fat_percentage);
    if (weight != null && fatPct != null) {
      const derivedFat = (weight * fatPct) / 100;
      const derivedLean = weight - derivedFat;
      if (fat == null) fat = derivedFat;
      if (lean == null) lean = derivedLean;
    }
  }
  return { lean, fat };
}

export function formatLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cmToIn(cm) {
  const n = toFiniteNumber(cm);
  return n == null ? null : n / 2.54;
}

export function kgToLb(kg) {
  const n = toFiniteNumber(kg);
  return n == null ? null : n * 2.2046226218;
}

export function formatLength(cm, units) {
  const n = toFiniteNumber(cm);
  if (n == null) return '—';
  if (units === 'imperial') {
    return `${(cmToIn(n)).toFixed(2)} in`;
  }
  return `${round1(n)} cm`;
}

export function formatMass(kg, units) {
  const n = toFiniteNumber(kg);
  if (n == null) return '—';
  if (units === 'imperial') {
    return `${round1(kgToLb(n))} lb`;
  }
  return `${round1(n)} kg`;
}

export function formatPercent(value) {
  const n = toFiniteNumber(value);
  if (n == null) return '—';
  return `${round2(n)}%`;
}

export function formatPlain(value) {
  const n = toFiniteNumber(value);
  if (n == null) return value == null || value === '' ? '—' : String(value);
  return String(round2(n));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Core circumference keys shown before "More". */
export const CORE_CIRC_KEYS = ['chest', 'waist', 'low_hips', 'high_hips'];

/**
 * Photo deletion date from FitXpress (~30 days after creation) when not provided.
 */
export function photoDeletionDate(measurement, scan) {
  const raw =
    measurement?.photos_deleted_at ||
    measurement?.photo_deletion_date ||
    measurement?.data_retention_until;
  if (raw) {
    try {
      return new Date(raw);
    } catch {
      // fall through
    }
  }
  const base = measurement?.created_at || scan?.createdAt || measurement?.completed_at;
  if (!base) return null;
  const d = new Date(base);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 30);
  return d;
}

export function formatScanDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}
