// apps/bot/src/handlers/textAuth.ts
import { Context, Markup } from 'telegraf';
import { BOT_SECONDARY_PASSWORD } from '../config';

export default async function textAuthHandler(ctx: Context, next: any) {
  ctx.session = ctx.session || {};
  if (ctx.session.state === 'awaitingPassword') {
    const text = ctx.message?.text || '';
    if (text === BOT_SECONDARY_PASSWORD) {
      ctx.session.isAdmin = true;
      ctx.session.state = null;
      return ctx.reply('Авторизация успешна. Вы администратор.', Markup.inlineKeyboard([
        [Markup.button.callback('Добавить продукт', 'ADD_PRODUCT')],
        [Markup.button.callback('Редактировать продукт', 'EDIT_PRODUCT')],
        [Markup.button.callback('Список заказов', 'LIST_ORDERS')],
        [Markup.button.callback('Добавить ивент', 'ADD_EVENT')],
      ]));
    } else {
      return ctx.reply('Неверный пароль. Попробуйте ещё раз.');
    }
  }

  // продолжение обработки обычных текстов
  return next();
}
