import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'node';

const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_REGION = process.env.S3_REGION || '';
const S3_KEY = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET = process.env.S3_SECRET_ACCESS_KEY || '';
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL_BASE || '';

const s3client = S3_BUCKET && S3_REGION && S3_KEY && S3_SECRET
  ? new S3Client({
      region: S3_REGION,
      credentials: { accessKeyId: S3_KEY, secretAccessKey: S3_SECRET }
    })
  : null;

function parseForm(req: Request) {
  const form = new formidable.IncomingForm();
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret') || '';
  if (!process.env.ADMIN_API_SECRET || secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { files } = await parseForm(req);
    const file = files.file;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const buffer = fs.readFileSync(file.path);
    const filename = `${Date.now()}-${(file.name || file.originalFilename || 'upload').replace(/\s+/g, '-')}`;

    if (s3client) {
      const key = `uploads/${filename}`;
      const cmd = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ACL: 'public-read',
      });
      await s3client.send(cmd);
      const url = PUBLIC_URL_BASE ? `${PUBLIC_URL_BASE.replace(/\/$/, '')}/${key}` : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
      return NextResponse.json({ url });
    } else {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      const base = process.env.SITE_URL?.replace(/\/$/, '') || '';
      const url = `${base}/uploads/${filename}`;
      return NextResponse.json({ url });
    }
  } catch (err: any) {
    console.error('upload error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
