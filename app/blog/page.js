import { getPublicBlogPosts } from '../../lib/get-public-blog-posts';
import BlogPageClient from './BlogPageClient';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const initialPosts = await getPublicBlogPosts();
  return <BlogPageClient initialPosts={initialPosts} />;
}
