import express from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';
import { BOT_TOKEN, ADMIN_IDS, ADMIN_PASSWORD } from './config';
import { startAddProduct, productFlowTextHandler, productFlowPhotoHandler, productFlowCallbackHandler, cancelAddProduct } from './admin/products/addProduct';
import addEventFlow from './admin/events/addEvent';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN as string);

// minimal session support for webhook mode (in-memory)
const sessions: Record<number, any> = {};

function getSession(ctx: any) {
  const id = ctx?.from?.id;
  if (!id) return {};
  sessions[id] = sessions[id] || { isAdmin: false, authStep: null, productDraft: null, productStep: null, eventDraft: null, eventStep: null };
  return sessions[id];
}

bot.use((ctx, next) => {
  ctx.session = getSession(ctx);
  return next();
});

bot.start(async (ctx) => {
  const fromId = ctx.from?.id;
  if (fromId && ADMIN_IDS.includes(fromId as number)) {
    ctx.session.authStep = 'await-password';
    await ctx.reply('Введите пароль администратора:');
    return;
  }
  await ctx.reply('Доступ ограничен.');
});

bot.on('text', async (ctx, next) => {
  ctx.session = ctx.session || {};
  const text = (ctx.message as any).text || '';
  if (ctx.session.authStep === 'await-password') {
    if (text === ADMIN_PASSWORD) {
      ctx.session.isAdmin = true;
      ctx.session.authStep = null;
      await ctx.reply('Авторизация выполнена. Доступные команды: /addproduct, /addevent, /cancel.');
      return;
    } else {
      await ctx.reply('Неверный пароль. Попробуйте ещё раз.');
      return;
    }
  }
  if (!ctx.session.isAdmin) return;
  await productFlowTextHandler(ctx, next);
});

bot.on(['photo', 'document'], async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return;
  await productFlowPhotoHandler(ctx);
});

bot.on('callback_query', async (ctx) => {
  await productFlowCallbackHandler(ctx);
});

bot.command('addproduct', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return ctx.reply('Доступ запрещён.');
  await startAddProduct(ctx);
});

bot.command('addevent', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return ctx.reply('Доступ запрещён.');
  await addEventFlow.startAddEvent(ctx);
});

bot.command('cancel', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return ctx.reply('Доступ запрещён.');
  await cancelAddProduct(ctx);
  await ctx.reply('Действие отменено.');
});

// Express wrapper to accept webhook posts from Telegram
const app = express();
app.use(bodyParser.json());

app.post('/telegram-webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
    res.sendStatus(200);
  } catch (e) {
    console.error('handleUpdate error', e);
    res.sendStatus(500);
  }
});

const PORT = process.env.BOT_WEBHOOK_PORT ? Number(process.env.BOT_WEBHOOK_PORT) : 3002;
app.listen(PORT, () => {
  console.log(`Bot webhook server listening on ${PORT}`);
});
