import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


const ADMIN_SECRET = process.env.ADMIN_API_SECRET || '';


export async function POST(req: NextRequest) {
const secret = req.headers.get('x-admin-secret') || '';
if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}


const body = await req.json();
const { slug, title, content } = body;
if (!slug || !title || content === undefined) {
return NextResponse.json({ error: 'slug, title and content required' }, { status: 400 });
}


const page = await prisma.staticPage.upsert({
where: { slug },
update: { title, content },
create: { slug, title, content },
});


return NextResponse.json({ ok: true, page });
}