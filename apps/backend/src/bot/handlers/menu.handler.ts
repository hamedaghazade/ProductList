import { Context, Markup } from 'telegraf';
import { env } from '../../config/env';
import { ProductService } from '../../services/product.service';
import { ExcelExportService } from '../../services/excel.service';
import { PdfExportService } from '../../services/pdf.service';

const productService = new ProductService();

export const registerMenuHandlers = (bot: any) => {
  bot.start(async (ctx: Context) => {
    const welcome =
      `👋 سلام به سیستم مدیریت بارکد و محصولات **ProductList** خوش آمدید.\n\n` +
      `از دکمه‌های زیر برای ثبت سریع کالا یا باز کردن مینی‌اپلیکیشن استفاده کنید:`;

    await ctx.reply(
      welcome,
      Markup.keyboard([
        ['📦 لیست محصولات', '➕ ثبت کالای جدید'],
        ['📊 دریافت خروجی اکسل', '📄 دریافت PDF گزارش'],
        ['🚀 باز کردن پنل گرافیکی (Mini App)'],
      ]).resize()
    );
  });

  bot.hears('🚀 باز کردن پنل گرافیکی (Mini App)', async (ctx: Context) => {
    await ctx.reply('جهت ورود به مینی‌اپ، روی دکمه زیر کلیک کنید:', {
      ...Markup.inlineKeyboard([
        Markup.button.webApp('📱 ورود به نرم‌افزار', env.TELEGRAM_WEBAPP_URL),
      ]),
    });
  });

  bot.hears('➕ ثبت کالای جدید', async (ctx: any) => {
    await ctx.scene.enter('ADD_PRODUCT_SCENE');
  });

  bot.hears('📊 دریافت خروجی اکسل', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const products = await productService.findByIds(userId);
    if (products.length === 0) {
      await ctx.reply('⚠️ شما هیچ محصولی ثبت نکرده‌اید.');
      return;
    }

    await ctx.reply('⏳ در حال آماده‌سازی فایل اکسل...');
    const buffer = await ExcelExportService.generateProductsWorkbook(products);
    await ctx.replyWithDocument({
      source: buffer,
      filename: `products_${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  });

  bot.hears('📄 دریافت PDF گزارش', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const products = await productService.findByIds(userId);
    if (products.length === 0) {
      await ctx.reply('⚠️ شما هیچ کالایی ثبت نکرده‌اید.');
      return;
    }

    await ctx.reply('⏳ در حال تولید فایل PDF چاپی...');
    const buffer = await PdfExportService.generateTablePdf(products);
    await ctx.replyWithDocument({
      source: buffer,
      filename: `products_table_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  });

  bot.hears('📦 لیست محصولات', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const result = await productService.findAll(userId, { limit: 5 });

    if (result.items.length === 0) {
      await ctx.reply('📭 هیچ کالایی در سامانه شما ثبت نشده است.');
      return;
    }

    let text = `📋 **آخرین محصولات ثبت‌شده (۵ مورد اخیر):**\n\n`;
    result.items.forEach((p, idx) => {
      text += `${idx + 1}. **${p.name}**\n   📦 بسته: ${p.quantityPerPackage} عددی | 💰 قیمت: ${p.price.toLocaleString('fa-IR')} ریال\n   🔢 بارکد: \`${p.barcode}\`\n\n`;
    });

    await ctx.reply(text, { parse_mode: 'Markdown' });
  });
};