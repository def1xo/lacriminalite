import { Telegraf, Markup, Context, session } from 'telegraf';
import { BOT_TOKEN, ADMIN_IDS, ADMIN_PASSWORD } from './config';
import { startAddProduct, productFlowTextHandler, productFlowPhotoHandler, productFlowCallbackHandler, cancelAddProduct } from './admin/products/addProduct';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN not set');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

type MySession = {
  isAdmin?: boolean;
  authStep?: 'await-password' | null;
  productDraft?: any;
  productStep?: string | null;
};
declare module 'telegraf' {
  interface Context {
    session: MySession;
  }
}

bot.use(session({ defaultSession: () => ({ isAdmin: false, authStep: null }) }));

bot.start(async (ctx: Context) => {
  const fromId = ctx.from?.id;
  ctx.session = ctx.session || {};
  if (fromId && ADMIN_IDS.includes(fromId as number)) {
    ctx.session.authStep = 'await-password';
    await ctx.reply('Введите пароль администратора:');
    return;
  }
  await ctx.reply('Доступ ограничен.');
});

bot.on('text', async (ctx) => {
  ctx.session = ctx.session || {};
  const text = (ctx.message as any).text || '';
  if (ctx.session.authStep === 'await-password') {
    if (text === ADMIN_PASSWORD) {
      ctx.session.isAdmin = true;
      ctx.session.authStep = null;
      await ctx.reply('Авторизация выполнена. Доступные команды: /addproduct, /cancel.');
      return;
    } else {
      await ctx.reply('Неверный пароль. Попробуйте ещё раз.');
      return;
    }
  }

  if (!ctx.session.isAdmin) {
    return; // ignore messages from non-admins
  }

  // pass to product flow text handler
  await productFlowTextHandler(ctx, () => Promise.resolve());
});

bot.on('photo', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return;
  await productFlowPhotoHandler(ctx);
});

bot.on('document', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return;
  await productFlowPhotoHandler(ctx);
});

bot.on('callback_query', async (ctx) => {
  try {
    await productFlowCallbackHandler(ctx);
  } catch (e) {
    console.error('callback handler error', e);
    try { await ctx.answerCbQuery('Ошибка'); } catch {}
  }
});

bot.command('addproduct', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return ctx.reply('Доступ запрещён.');
  await startAddProduct(ctx);
});

bot.command('cancel', async (ctx) => {
  ctx.session = ctx.session || {};
  if (!ctx.session.isAdmin) return ctx.reply('Доступ запрещён.');
  await cancelAddProduct(ctx);
  await ctx.reply('Действие отменено.');
});

bot.launch().then(() => console.log('Bot started')).catch(err => console.error('Bot failed to start', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
