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
