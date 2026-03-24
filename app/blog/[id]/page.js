import { notFound } from 'next/navigation';
import { getBlogPostById } from '../../../lib/get-public-blog-posts';
import BlogPostPageClient from './BlogPostPageClient';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const id = resolvedParams?.id;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  return <BlogPostPageClient initialPost={post} />;
}
