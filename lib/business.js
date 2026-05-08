/**
 * Google Business Profile — used in schema sameAs and hasMap.
 * CID: 9887309995166394944
 */
export const GOOGLE_BUSINESS_PROFILE_URL =
  'https://www.google.com/maps/place/Svelte+by+LuKaria/@18.118212,-77.9355935,9z/data=!4m10!1m2!2m1!1ssvelte+by+lukaria+jamaica!3m6!1s0x47fd40404dfbb82d:0x8936e50b7d80ea40!8m2!3d18.1193338!4d-77.2761154!15sChlzdmVsdGUgYnkgbHVrYXJpYSBqYW1haWNhkgEObWVkaWNhbF9jbGluaWPgAQA!16s%2Fg%2F11mkzwccq_?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D';

/**
 * Registered office & hours — used on Contact page and JSON-LD only (not homepage hero).
 * Google requires visible content to match structured data; keep NAP off marketing splash pages.
 */
export const REGISTERED_OFFICE = {
  streetAddress: '19 Fairdene Avenue',
  addressLocality: 'Kingston',
  addressRegion: 'Jamaica',
  addressCountry: 'JM',
};

export const REGISTERED_OFFICE_DISPLAY = 'Kingston, Jamaica';

/** Shown on Contact page — edit here if your hours change */
export const OFFICE_HOURS_DISPLAY =
  'Monday–Friday: 9:00 AM – 5:00 PM (Jamaica time)';

/** Schema.org — weekday office hours (America/Jamaica implied) */
export const OFFICE_OPENING_HOURS_SCHEMA = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  },
];

/**
 * Convert YouTube watch URL, youtu.be, or 11-char video ID to embed URL.
 */
export function getYouTubeEmbedUrl(input) {
  if (!input || !String(input).trim()) return null;
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return `https://www.youtube.com/embed/${s}`;
  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').split(/[/?]/)[0];
      if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return `https://www.youtube.com/embed/${v}`;
      const m = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

/** YouTube video ID for thumbnails (mqdefault.jpg) */
export function getYouTubeVideoId(input) {
  const embed = getYouTubeEmbedUrl(input);
  if (!embed) return null;
  const m = embed.match(/\/embed\/([\w-]{11})/);
  return m ? m[1] : null;
}
