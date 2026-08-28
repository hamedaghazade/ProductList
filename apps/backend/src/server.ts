import app from './app';
import { env } from './config/env';
import { createBot } from './bot';

const startServer = async () => {
  const bot = createBot();
  if (bot) {
    bot.launch().then(() => {
      console.log('🤖 Telegram Bot launched successfully');
    }).catch((err) => {
      console.error('Failed to launch Telegram Bot:', err.message);
    });
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();