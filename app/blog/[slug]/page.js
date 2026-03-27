import { notFound, permanentRedirect } from 'next/navigation';
import {
  getBlogPostBySegment,
  getCanonicalBlogSegment,
  getRelatedBlogPosts,
} from '../../../lib/get-public-blog-posts';
import BlogPostPageClient from './BlogPostPageClient';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const segment = resolvedParams?.slug;
  if (!segment) notFound();

  const post = await getBlogPostBySegment(segment);
  if (!post) notFound();

  const canonicalSeg = getCanonicalBlogSegment(post);
  if (canonicalSeg && canonicalSeg !== segment) {
    permanentRedirect(`/blog/${canonicalSeg}`);
  }

  const relatedPosts = await getRelatedBlogPosts(post._id, 5);
  return <BlogPostPageClient initialPost={post} relatedPosts={relatedPosts} />;
}
