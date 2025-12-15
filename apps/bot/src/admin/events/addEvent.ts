import fetch from 'node-fetch';
import FormData from 'form-data';
import { Context, Markup } from 'telegraf';
import { BOT_TOKEN, SITE_ADMIN_API, ADMIN_API_SECRET, SITE_UPLOAD_API } from '../../config';

type EventDraft = {
  title?: string;
  slug?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  price?: number;
  images?: string[];
  meta?: Record<string, any>;
};

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
    headers: { 'x-admin-secret': ADMIN_API_SECRET || '' } as any,
    body: form as any
  });
  const json = await res.json();
  if (!res.ok) throw new Error('upload failed: ' + JSON.stringify(json));
  const url = json.url || (json.urls && json.urls[0]) || (json.data && (json.data.url || (json.data.urls && json.data.urls[0])));
  if (!url) throw new Error('no url from upload');
  return url as string;
}

export default {
  async startAddEvent(ctx: Context) {
    if (!ctx.session?.isAdmin) return ctx.reply('Доступ запрещён.');
    ctx.session.eventDraft = {} as EventDraft;
    ctx.session.eventStep = 'title';
    return ctx.reply('Добавление ивента. Введите название:');
  },

  async eventFlowTextHandler(ctx: Context, next: any) {
    ctx.session = ctx.session || {};
    const step = ctx.session.eventStep;
    if (!step) return next();
    ctx.session.eventDraft = ctx.session.eventDraft || {};
    const text = (ctx.message && (ctx.message as any).text) ? ((ctx.message as any).text as string).trim() : '';
    try {
      switch (step) {
        case 'title':
          if (!text) return ctx.reply('Название не может быть пустым. Введите название:');
          ctx.session.eventDraft.title = text;
          ctx.session.eventStep = 'startsAt';
          return ctx.reply('Введите дату/время начала (ISO или DD.MM.YYYY HH:MM):');
        case 'startsAt':
          ctx.session.eventDraft.startsAt = text;
          ctx.session.eventStep = 'endsAt';
          return ctx.reply('Введите дату/время окончания (или напишите skip):');
        case 'endsAt':
          if (text.toLowerCase() !== 'skip') ctx.session.eventDraft.endsAt = text;
          ctx.session.eventStep = 'price';
          return ctx.reply('Введите цену (число) или 0 для бесплатного:');
        case 'price':
          const p = Number(text || '0');
          ctx.session.eventDraft.price = Number.isNaN(p) ? 0 : Math.floor(p);
          ctx.session.eventStep = 'description';
          return ctx.reply('Введите описание ивента:');
        case 'description':
          ctx.session.eventDraft.description = text || '';
          ctx.session.eventDraft.images = [];
          ctx.session.eventStep = 'images';
          return ctx.reply('Пришлите фото/афишу (можно несколько). Когда закончите — напишите done или skip.');
        case 'images':
          {
            const cmd = text.toLowerCase();
            if (cmd === 'skip' || cmd === 'done') {
              ctx.session.eventStep = 'confirm';
              return await sendEventSummaryAndConfirm(ctx);
            }
            return ctx.reply('Пришлите фото или напишите done/skip.');
          }
        default:
          return next();
      }
    } catch (e:any) {
      console.error('eventFlowTextHandler', e);
      return ctx.reply('Ошибка при вводе. Попробуйте ещё раз.');
    }
  },

  async eventFlowPhotoHandler(ctx: Context) {
    ctx.session = ctx.session || {};
    if (ctx.session.eventStep !== 'images') return;
    try {
      let fileId: string | undefined;
      if (ctx.message && (ctx.message as any).photo) {
        const photos = (ctx.message as any).photo as Array<any>;
        if (photos.length > 0) fileId = photos[photos.length - 1].file_id;
      } else if (ctx.message && (ctx.message as any).document) {
        fileId = (ctx.message as any).document.file_id;
      }
      if (!fileId) return ctx.reply('Не удалось получить файл.');
      await ctx.reply('Фото получено, загружаю...');
      const filePath = await telegramGetFilePath(fileId);
      const buffer = await telegramDownloadFileBuffer(filePath);
      const originalName = filePath.split('/').pop() || `event-${Date.now()}.jpg`;
      const uploadedUrl = await uploadBufferToSite(buffer, originalName);
      ctx.session.eventDraft = ctx.session.eventDraft || {};
      ctx.session.eventDraft.images = ctx.session.eventDraft.images || [];
      ctx.session.eventDraft.images.push(uploadedUrl);
      return ctx.reply(`Фото загружено: ${uploadedUrl}\nДобавьте ещё или отправьте done.`);
    } catch (e:any) {
      console.error('eventFlowPhotoHandler', e);
      return ctx.reply('Ошибка при загрузке фото: ' + (e.message || String(e)));
    }
  },

  async eventFlowCallbackHandler(ctx: any) {
    const data: string = ctx.callbackQuery?.data;
    if (!data) return;
    ctx.session = ctx.session || {};
    if (!ctx.session.eventDraft) {
      await ctx.answerCbQuery();
      return;
    }
    if (data === 'CONFIRM_CREATE_EVENT') {
      const draft: EventDraft = ctx.session.eventDraft;
      if (!draft.title) {
        await ctx.editMessageText('Не заполнено название ивента.');
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
          body: JSON.stringify({ action: 'addEvent', payload: draft })
        });
        const json = await res.json();
        if (!res.ok) {
          await ctx.editMessageText('Ошибка создания ивента: ' + (json.error || JSON.stringify(json)));
          await ctx.answerCbQuery();
          return;
        }
        await ctx.editMessageText(`✅ Ивент создан: ${json.event?.title || draft.title}`);
      } catch (err:any) {
        console.error('create event error', err);
        await ctx.editMessageText('Ошибка при создании ивента: ' + (err.message || String(err)));
      } finally {
        ctx.session.eventDraft = null;
        ctx.session.eventStep = null;
      }
      await ctx.answerCbQuery();
      return;
    }
    if (data === 'CANCEL_CREATE_EVENT') {
      ctx.session.eventDraft = null;
      ctx.session.eventStep = null;
      await ctx.editMessageText('Создание ивента отменено.');
      await ctx.answerCbQuery('Отменено');
      return;
    }
    await ctx.answerCbQuery();
  }
};

async function sendEventSummaryAndConfirm(ctx: Context) {
  const d = ctx.session.eventDraft as EventDraft;
  const lines: string[] = [];
  lines.push(`Подтвердите создание ивента:`);
  lines.push(`Название: ${d.title || '-'}`);
  lines.push(`Дата начала: ${d.startsAt || '-'}`);
  lines.push(`Дата конца: ${d.endsAt || '-'}`);
  lines.push(`Цена: ${d.price ?? 'Бесплатно'}`);
  lines.push(`Описание: ${d.description ? d.description.substring(0, 200) : '-'}`);
  if (d.images && d.images.length) lines.push(`Фото:\n${d.images.map((u,i)=>`${i+1}. ${u}`).join('\n')}`);
  await ctx.reply(lines.join('\n'), Markup.inlineKeyboard([
    Markup.button.callback('Создать ивент', 'CONFIRM_CREATE_EVENT'),
    Markup.button.callback('Отменить', 'CANCEL_CREATE_EVENT')
  ]));
  return;
}
