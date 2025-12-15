import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const page = await prisma.staticPage.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ slug, title: null, content: null });
  return NextResponse.json({ slug: page.slug, title: page.title, content: page.content });
}
