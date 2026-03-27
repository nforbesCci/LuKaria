/**
 * URL-safe slugs for public blog post routes.
 */

export function slugifyTitle(title) {
  const s = String(title || '')
                                    .toLowerCase()
                                    .normalize('NFKD')
                                    .replace(/[\u0300-\u036f]/g, '')
                                    .replace(/[^a-z0-9]+/g, '-')
                                    .replace(/^-+|-+$/g, '')
                                    .slice(0, 80);
  return s || 'post';
}

/**
 * @param {import('mongodb').Collection} collection blogPosts
 * @param {string} title
 * @param {import('mongodb').ObjectId | null} excludeObjectId
 */
export async function allocateUniqueSlug(collection, title, excludeObjectId = null) {
  const base = slugifyTitle(title);
  let slug = base;
  let n = 0;
  for (;;) {
    const query =
      excludeObjectId != null ? { slug, _id: { $ne: excludeObjectId } } : { slug };
    const exists = await collection.findOne(query);
    if (!exists) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}
