import { getBlogPostBySegment } from '../../../lib/get-public-blog-posts';
import { getPublicBlogCanonicalUrl } from '../../../lib/blog-url';

export async function generateMetadata({ params }) {
  const { slug: segment } = await params;
  if (!segment) {
    return { title: 'Blog | Svelte by LuKaria' };
  }
  try {
    const post = await getBlogPostBySegment(segment);
    if (!post) {
      return { title: 'Blog Post | Svelte by LuKaria' };
    }
    const title = `${post.title} | Blog`;
    const desc =
      (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 160) ||
      'Blog post from Svelte by LuKaria';
    const url = getPublicBlogCanonicalUrl(post);
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
