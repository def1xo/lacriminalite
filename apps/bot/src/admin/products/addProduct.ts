import fetch from 'node-fetch';
import FormData from 'form-data';
import { Context, Markup } from 'telegraf';
import { BOT_TOKEN, SITE_ADMIN_API, ADMIN_API_SECRET, SITE_UPLOAD_API } from '../../config';

type ProductDraft = {
  title?: string;
  slug?: string;
  collection?: 'limited' | 'regular';
  totalMade?: number;
  sizeStock?: Record<string, number>;
  price?: number;
  description?: string;
  images?: string[];
};

function simpleSlugify(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function telegramGetFilePath(fileId: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const json = await res.json();
  if (!json.ok) throw new Error('tg getFile failed');
  return json.result.file_path as string;
}

async function telegramDownloadFileBuffer(filePath: string) {
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('tg download failed');
  const buffer = await res.buffer();
  return buffer;
}

async function uploadBufferToSite(buffer: Buffer, filename: string) {
  const form = new FormData();
  form.append('file', buffer, { filename });
  const uploadUrl = SITE_UPLOAD_API || `${SITE_ADMIN_API.replace(/\/api\/admin$/, '')}/api/upload`;
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'x-admin-secret': ADMIN_API_SECRET || ''
    } as any,
    body: form as any
  });
  const json = await res.json();
  if (!res.ok) throw new Error('upload failed: ' + JSON.stringify(json));
  const url = json.url || (json.urls && json.urls[0]) || (json.data && (json.data.url || (json.data.urls && json.data.urls[0])));
  if (!url) throw new Error('no url from upload');
  return url as string;
}

export async function startAddProduct(ctx: Context) {
  if (!ctx.session?.isAdmin) return ctx.reply('Доступ запрещён.');
  ctx.session.productDraft = {} as ProductDraft;
  ctx.session.productStep = 'title';
  return ctx.reply('Добавление продукта. Введите название продукта:');
}

export async function productFlowTextHandler(ctx: Context, next: any) {
  ctx.session = ctx.session || {};
  const step = ctx.session.productStep;
  if (!step) return next();
  ctx.session.productDraft = ctx.session.productDraft || {};
  const text = (ctx.message && (ctx.message as any).text) ? ((ctx.message as any).text as string).trim() : '';
  try {
    switch (step) {
      case 'title':
        if (!text) return ctx.reply('Название не может быть пустым. Введите название:');
        ctx.session.productDraft.title = text;
        ctx.session.productDraft.slug = simpleSlugify(text);
        ctx.session.productStep = 'slug';
        return ctx.reply(`Slug предложен: \`${ctx.session.productDraft.slug}\`. Нажмите /acceptslug чтобы принять или введите свой slug.`, { parse_mode: 'Markdown' });
      case 'slug':
        if (text && text !== '/acceptslug') {
          ctx.session.productDraft.slug = simpleSlugify(text);
        }
        ctx.session.productStep = 'collection';
        return ctx.reply('Выберите коллекцию:', Markup.inlineKeyboard([
          Markup.button.callback('Limited', 'COLLECTION_limited'),
          Markup.button.callback('Regular', 'COLLECTION_regular')
        ]));
      case 'totalMade':
        {
          const n = Number(text);
          if (Number.isNaN(n) || n < 0) return ctx.reply('Введите корректное целое число:');
          ctx.session.productDraft.totalMade = Math.floor(n);
          ctx.session.productStep = 'sizeStock';
          return ctx.reply('Введите распределение по размерам в формате S:5,M:3,L:2 или отправьте skip:');
        }
      case 'sizeStock':
        {
          if (text.toLowerCase() === 'skip') {
            ctx.session.productStep = 'price';
            return ctx.reply('Введите цену в рублях (целое число):');
          }
          try {
            const map: Record<string, number> = {};
            const pairs = text.split(',').map(p => p.trim()).filter(Boolean);
            for (const p of pairs) {
              const [size, qty] = p.split(':').map(s => s.trim());
              if (!size) continue;
              map[size] = Number(qty) || 0;
            }
            ctx.session.productDraft.sizeStock = map;
          } catch (e) {
            return ctx.reply('Не удалось распарсить. Введите как S:5,M:3,L:2 или отправьте skip.');
          }
          ctx.session.productStep = 'price';
          return ctx.reply('Введите цену в рублях (целое число):');
        }
      case 'price':
        {
          const p = Number(text);
          if (Number.isNaN(p) || p < 0) return ctx.reply('Введите корректную цену:');
          ctx.session.productDraft.price = Math.floor(p);
          ctx.session.productStep = 'description';
          return ctx.reply('Введите краткое описание продукта:');
        }
      case 'description':
        ctx.session.productDraft.description = text || '';
        ctx.session.productDraft.images = [];
        ctx.session.productStep = 'images';
        return ctx.reply('Пришлите фото продукта (можно несколько). Для завершения отправьте done. Если хотите пропустить — отправьте skip.');
      case 'images':
        {
          if (!text) return ctx.reply('Ожидаю фото или команду done/skip.');
          const cmd = text.toLowerCase();
          if (cmd === 'skip' || cmd === 'done') {
            ctx.session.productStep = 'confirm';
            return await sendDraftSummaryAndConfirm(ctx);
          }
          return ctx.reply('Во время ожидания фото можно отправить done или skip.');
        }
      default:
        return next();
    }
  } catch (err: any) {
    console.error('productFlowTextHandler error', err);
    return ctx.reply('Ошибка. Попробуйте ещё раз или отмените командой /cancel.');
  }
}

export async function productFlowPhotoHandler(ctx: Context) {
  ctx.session = ctx.session || {};
  if (ctx.session.productStep !== 'images') return;
  try {
    let fileId: string | undefined;
    if (ctx.message && (ctx.message as any).photo) {
      const photos = (ctx.message as any).photo as Array<any>;
      if (photos.length > 0) fileId = photos[photos.length - 1].file_id;
    } else if (ctx.message && (ctx.message as any).document) {
      fileId = (ctx.message as any).document.file_id;
    }
    if (!fileId) {
      return ctx.reply('Не удалось получить файл. Попробуйте ещё раз.');
    }
    await ctx.reply('Фото получено, загружаю...');
    const filePath = await telegramGetFilePath(fileId);
    const buffer = await telegramDownloadFileBuffer(filePath);
    const originalName = filePath.split('/').pop() || `photo-${Date.now()}.jpg`;
    const uploadedUrl = await uploadBufferToSite(buffer, originalName);
    ctx.session.productDraft = ctx.session.productDraft || {};
    ctx.session.productDraft.images = ctx.session.productDraft.images || [];
    ctx.session.productDraft.images.push(uploadedUrl);
    return ctx.reply(`Фото загружено: ${uploadedUrl}\nЕсли хотите добавить ещё — пришлите их. Когда закончите — отправьте done.`);
  } catch (err: any) {
    console.error('productFlowPhotoHandler error', err);
    return ctx.reply('Ошибка загрузки фото: ' + (err.message || String(err)));
  }
}

export async function productFlowCallbackHandler(ctx: any) {
  const data: string = ctx.callbackQuery?.data;
  if (!data) return;
  ctx.session = ctx.session || {};
  if (!ctx.session.productDraft) {
    await ctx.answerCbQuery();
    return;
  }
  if (data.startsWith('COLLECTION_')) {
    const col = data.split('_')[1] as 'limited' | 'regular';
    ctx.session.productDraft.collection = col;
    ctx.session.productStep = 'totalMade';
    await ctx.editMessageText(`Коллекция выбрана: ${col}. Сколько всего пошито (число)?`);
    await ctx.answerCbQuery();
    return;
  }
  if (data === 'CONFIRM_CREATE') {
    const draft: ProductDraft = ctx.session.productDraft;
    if (!draft.title || !draft.slug || !draft.price) {
      await ctx.editMessageText('Невозможно создать продукт: не заполнены обязательные поля (title/slug/price).');
      await ctx.answerCbQuery();
      return;
    }
    try {
      const res = await fetch(SITE_ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_API_SECRET || ''
        },
        body: JSON.stringify({ action: 'addProduct', payload: draft })
      });
      const json = await res.json();
      if (!res.ok) {
        console.error('admin api addProduct error', json);
        await ctx.editMessageText('Ошибка создания продукта: ' + (json.error || JSON.stringify(json)));
        await ctx.answerCbQuery();
        return;
      }
      await ctx.editMessageText(`✅ Продукт создан: ${json.product?.title || draft.title} (id: ${json.product?.id || 'n/a'})`);
    } catch (err: any) {
      console.error('addProduct final error', err);
      await ctx.editMessageText('Ошибка при создании продукта: ' + (err.message || String(err)));
    } finally {
      ctx.session.productDraft = null;
      ctx.session.productStep = null;
    }
    await ctx.answerCbQuery();
    return;
  }
  if (data === 'CANCEL_CREATE') {
    ctx.session.productDraft = null;
    ctx.session.productStep = null;
    await ctx.editMessageText('Создание продукта отменено.');
    await ctx.answerCbQuery('Отменено');
    return;
  }
  await ctx.answerCbQuery();
}

async function sendDraftSummaryAndConfirm(ctx: Context) {
  const d = ctx.session.productDraft as ProductDraft;
  const lines: string[] = [];
  lines.push(`Подтвердите создание продукта:`);
  lines.push(`Название: ${d.title || '-'}`);
  lines.push(`Slug: ${d.slug || '-'}`);
  lines.push(`Коллекция: ${d.collection || '-'}`);
  lines.push(`Шито всего: ${d.totalMade ?? '-'}`);
  if (d.sizeStock) lines.push(`Размеры: ${Object.entries(d.sizeStock).map(([k, v]) => `${k}:${v}`).join(', ')}`);
  lines.push(`Цена: ${d.price ?? '-'}`);
  lines.push(`Описание: ${d.description ? d.description.substring(0, 200) : '-'}`);
  if (d.images && d.images.length) {
    lines.push(`Фото:${d.images.map((u, i) => `\n${i + 1}. ${u}`).join('')}`);
  } else {
    lines.push(`Фото: нет`);
  }
  await ctx.reply(lines.join('\n'), Markup.inlineKeyboard([
    Markup.button.callback('Создать продукт', 'CONFIRM_CREATE'),
    Markup.button.callback('Отменить', 'CANCEL_CREATE')
  ]));
  return;
}

export async function cancelAddProduct(ctx: Context) {
  ctx.session.productDraft = null;
  ctx.session.productStep = null;
  return ctx.reply('Создание продукта отменено.');
}
