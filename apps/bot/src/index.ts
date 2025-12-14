// Заменить/обновить файл: apps/bot/src/index.ts
import { Telegraf, session } from 'telegraf';
import startHandler from './handlers/start';
import textAuthHandler from './handlers/textAuth';
import botConfig from './config';

// импорт наших product flow handlers
import {
  startAddProduct,
  productFlowTextHandler,
  productFlowPhotoHandler,
  productFlowCallbackHandler,
  cancelAddProduct,
} from './admin/products/addProduct';

const bot = new Telegraf(botConfig.BOT_TOKEN);

// session middleware
bot.use(session({ initial: () => ({}) }));

// базовые handlers
bot.start(startHandler);
bot.on('text', textAuthHandler); // auth + other text handler chain

// product flow registration
// startAddProduct — запускается по inline-кнопке 'ADD_PRODUCT' или командой /addproduct
bot.command('addproduct', async ctx => startAddProduct(ctx));
bot.action('ADD_PRODUCT', async ctx => {
  await startAddProduct(ctx);
  await ctx.answerCbQuery();
});

// регистрация state handlers
bot.on('text', productFlowTextHandler);          // обработка шагов (title, slug, price, и т.д.)
bot.on('photo', productFlowPhotoHandler);        // загрузка фото (telegram file)
bot.on('document', productFlowPhotoHandler);     // также документы (png, webp, т.п.)
bot.on('callback_query', productFlowCallbackHandler); // inline действия (COLLECTION_, CONFIRM_CREATE, ...)

// cancel
bot.command('cancel', cancelAddProduct);

// запуск
if (require.main === module) {
  bot.launch().then(() => console.log('Bot started'));
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export default bot;
