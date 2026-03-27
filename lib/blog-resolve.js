import { ObjectId } from 'mongodb';

/**
 * Resolve URL segment to post ObjectId (slug takes precedence over legacy id).
 */
export async function resolveBlogPostObjectId(db, segment) {
  if (!segment || typeof segment !== 'string') return null;
  const coll = db.collection('blogPosts');
  const bySlug = await coll.findOne({ slug: segment });
  if (bySlug) return bySlug._id;
  if (ObjectId.isValid(segment)) {
    const byId = await coll.findOne({ _id: new ObjectId(segment) });
    if (byId) return byId._id;
  }
  return null;
}
