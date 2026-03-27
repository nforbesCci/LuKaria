/**
 * Server-only: blog posts for SSR (crawlable by Google).
 * JSON-serializable: ObjectId → string, Dates → ISO strings.
 */
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

function serializePost(doc) {
  if (!doc) return null;
  const out = {
    ...doc,
    _id: String(doc._id),
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
  if (Array.isArray(out.comments)) {
    out.comments = out.comments.map((c) => {
      const { _id: omitId, ...rest } = c;
      return {
        ...rest,
        id: c.id || (omitId ? String(omitId) : null),
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      };
    });
  }
  return out;
}

export async function getBlogPostById(id) {
  try {
    if (!process.env.MONGODB_URI || !id) return null;
    const db = await getDatabase();
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(id) });
    return serializePost(post);
  } catch (err) {
    console.error('getBlogPostById:', err?.message || err);
    return null;
  }
}

/** Public blog URL segment (slug preferred, else legacy Mongo _id). Exported for metadata/redirects. */
export { getPublicBlogSegment as getCanonicalBlogSegment } from './blog-url';

/**
 * Load post by public URL segment: slug first, then legacy ObjectId.
 */
export async function getBlogPostBySegment(segment) {
  try {
    if (!process.env.MONGODB_URI || !segment || typeof segment !== 'string') return null;
    const db = await getDatabase();
    const coll = db.collection('blogPosts');
    let doc = await coll.findOne({ slug: segment });
    if (!doc && ObjectId.isValid(segment)) {
      doc = await coll.findOne({ _id: new ObjectId(segment) });
    }
    return serializePost(doc);
  } catch (err) {
    console.error('getBlogPostBySegment:', err?.message || err);
    return null;
  }
}

/** Related posts for internal linking (newest first, excludes current). */
export async function getRelatedBlogPosts(excludeId, limit = 5) {
  try {
    if (!process.env.MONGODB_URI || !excludeId) return [];
    const db = await getDatabase();
    const oid =
      typeof excludeId === 'string' && ObjectId.isValid(excludeId)
        ? new ObjectId(excludeId)
        : excludeId;
    const posts = await db
      .collection('blogPosts')
      .find({ _id: { $ne: oid } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return posts.map(serializePost).filter(Boolean);
  } catch (err) {
    console.error('getRelatedBlogPosts:', err?.message || err);
    return [];
  }
}

export async function getPublicBlogPosts() {
  try {
    if (!process.env.MONGODB_URI) {
      return [];
    }
    const db = await getDatabase();
    const posts = await db
      .collection('blogPosts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return posts.map(serializePost).filter(Boolean);
  } catch (err) {
    console.error('getPublicBlogPosts:', err?.message || err);
    return [];
  }
}
