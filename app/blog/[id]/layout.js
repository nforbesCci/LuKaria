import { ObjectId } from 'mongodb';
import { SITE_URL } from '../../../lib/public-seo';

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return { title: 'Blog | Svelte by LuKaria' };
  }
  try {
    const { getDatabase } = await import('../../../lib/mongodb');
    const db = await getDatabase();
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(id) });
    if (!post) {
      return { title: 'Blog Post | Svelte by LuKaria' };
    }
    const title = `${post.title} | Blog | Svelte by LuKaria`;
    const desc =
      (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) ||
      'Blog post from Svelte by LuKaria';
    const url = `${SITE_URL}/blog/${id}`;
    return {
      title,
      description: desc,
      alternates: { canonical: url },
      openGraph: {
        title,
        description: desc,
        url,
        siteName: 'Svelte by LuKaria',
        locale: 'en_JM',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
      },
    };
  } catch {
    return { title: 'Blog | Svelte by LuKaria' };
  }
}

export default function BlogPostLayout({ children }) {
  return children;
}
