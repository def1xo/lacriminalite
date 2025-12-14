import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'node';

const BUCKET = process.env.S3_BUCKET || '';
const REGION = process.env.S3_REGION || '';
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const PUBLIC_URL_BASE = process.env.S3_PUBLIC_URL_BASE || '';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY
  }
});

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret') || '';
  if (secret !== process.env.ADMIN_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = new formidable.IncomingForm();
  return new Promise((resolve) => {
    form.parse(req as any, async (err: any, fields: any, files: any) => {
      if (err) {
        return resolve(NextResponse.json({ error: 'parse error' }, { status: 500 }));
      }
      try {
        const file = files.file;
        if (!file) {
          return resolve(NextResponse.json({ error: 'no file' }, { status: 400 }));
        }
        const data = fs.readFileSync(file.path);
        const filename = `${Date.now()}-${file.name || file.originalFilename}`;
        const key = `uploads/${filename}`;
        const cmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: data,
          ACL: 'public-read'
        });
        await s3.send(cmd);
        const url = PUBLIC_URL_BASE ? `${PUBLIC_URL_BASE.replace(/\/$/, '')}/${key}` : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
        return resolve(NextResponse.json({ url }));
      } catch (e) {
        return resolve(NextResponse.json({ error: 'internal' }, { status: 500 }));
      }
    });
  });
}
