import { Telegraf } from 'telegraf';
import { botConfig } from './config/bot.config';

const bot = new Telegraf(botConfig.botToken);

bot.start((ctx) => {
  const userName = ctx.from?.first_name || 'کاربر';
  ctx.reply(
    `سلام ${userName} عزیز! 🌸\nبه سامانه مدیریت محصولات و بارکد خوش آمدید.\n\nاز دکمه زیر برای باز کردن Mini App یا مدیریت محصولات استفاده کنید.`,
    {
      reply_markup: {
        keyboard: [
          [{ text: '📦 باز کردن برنامه مدیریت محصولات', web_app: { url: botConfig.webAppUrl || 'https://google.com' } }],
          [{ text: '➕ افزودن محصول جدید' }, { text: '📋 لیست محصولات' }],
          [{ text: '📊 دریافت خروجی Excel' }, { text: '📄 دریافت خروجی PDF' }]
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.help((ctx) => {
  ctx.reply(
    'راهنمای ربات:\n- افزودن محصول: دریافت اطلاعات و تولید خودکار بارکد\n- لیست محصولات: مشاهده ۵ محصول اخیر\n- خروجی‌ها: دانلود گزارش‌ها در قالب فایل استاندارد'
  );
});

// مدیریت متوقف‌سازی استاندارد (Graceful Shutdown)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch().then(() => {
  console.log('🚀 ربات تلگرام با موفقیت اجرا شد و آماده دریافت پیام است.');
}).catch((err) => {
  console.error('❌ خطا در راه‌اندازی ربات تلگرام:', err);
});