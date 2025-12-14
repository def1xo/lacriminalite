// apps/bot/src/handlers/start.ts
import { Context } from 'telegraf';
import { ADMIN_IDS } from '../config';

export default async function startHandler(ctx: Context) {
  const userId = ctx.from?.id;
  if (!userId) return ctx.reply('Не удалось определить ваш ID.');

  if (!ADMIN_IDS.includes(userId)) {
    return ctx.reply('Доступ запрещён. Ваш ID не в списке администраторов.');
  }

  ctx.session = ctx.session || {};
  ctx.session.state = 'awaitingPassword';
  return ctx.reply('Введите пароль администратора:');
}
