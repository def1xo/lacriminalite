'use client';
import { useState } from 'react';

export default function AdminPagesEditor() {
  const [secret, setSecret] = useState('');
  const [slug, setSlug] = useState('about');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  async function loadPage() {
    setStatus('loading');
    try {
      const res = await fetch(`/api/pages/${slug}`);
      const json = await res.json();
      setTitle(json.title || '');
      setContent(json.content || '');
      setStatus('loaded');
    } catch (e) {
      setStatus('error');
    }
  }

  async function savePage() {
    setStatus('saving');
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret
        },
        body: JSON.stringify({ slug, title, content })
      });
      const json = await res.json();
      if (json.ok) setStatus('saved');
      else setStatus('error');
    } catch (e) {
      setStatus('error');
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Редактор статичных страниц</h1>
        <div className="mb-3">
          <label className="block text-sm mb-1">Admin secret</label>
          <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="ADMIN_API_SECRET" className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={loadPage} className="px-4 py-2 bg-gray-800 text-white rounded">Загрузить</button>
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Content (HTML)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="flex gap-2">
          <button onClick={savePage} className="px-4 py-2 bg-black text-white rounded">Сохранить</button>
          <div className="px-3 py-2 rounded border">{status}</div>
        </div>
      </div>
    </main>
  );
}
