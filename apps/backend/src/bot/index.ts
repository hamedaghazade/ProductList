import { Telegraf, Scenes, session } from 'telegraf';
import { env } from '../config/env';
import { addProductWizard } from './scenes/add-product.wizard';
import { registerMenuHandlers } from './handlers/menu.handler';

export const createBot = () => {
  if (!env.BOT_TOKEN) {
    console.warn('⚠️ BOT_TOKEN تعریف نشده است. ربات تلگرام غیرفعال خواهد بود.');
    return null;
  }

  const bot = new Telegraf<Scenes.WizardContext>(env.BOT_TOKEN);
  const stage = new Scenes.Stage<Scenes.WizardContext>([addProductWizard as any]);

  bot.use(session());
  bot.use(stage.middleware());

  registerMenuHandlers(bot);

  return bot;
};