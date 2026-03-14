import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function isDoctorOrAdmin(session) {
  const groups = session?.user?.groups || session?.user?.['https://lukariagroup.com/roles'] || [];
  return groups.includes('Admin') || groups.includes('Doctor');
}

export async function GET(request) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single post
      const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(id) });
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    // List all posts (newest first)
    const posts = await db.collection('blogPosts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user || !isDoctorOrAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized. Doctor or Admin required.' }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const imageFile = formData.get('image');

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(imageFile.name) || '.jpg';
      const filename = `blog-${Date.now()}${ext}`;
      const blogDir = path.join(process.cwd(), 'public', 'images', 'blog');
      await mkdir(blogDir, { recursive: true });
      const filepath = path.join(blogDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/images/blog/${filename}`;
    }

    const db = await getDatabase();
    const doc = {
      title,
      content,
      imageUrl,
      authorId: session.user.sub,
      authorName: session.user.name || 'Doctor',
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    };

    const result = await db.collection('blogPosts').insertOne(doc);
    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
