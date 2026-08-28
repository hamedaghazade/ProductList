import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { ProductSchema, validateEan13Checksum } from '@shared/validators/product.schema';
import { ExcelService } from '../../backend/src/services/excel.service';
import { PdfService } from '../../backend/src/services/pdf.service';
import { BarcodeService } from '../../backend/src/services/barcode.service';

interface WizardSessionData extends Scenes.WizardSessionData {
  productData: {
    name?: string;
    quantityPerPackage?: number;
    price?: number;
    barcode?: string;
  };
}

type BotContext = Scenes.WizardContext<WizardSessionData>;

const prisma = new PrismaClient();
const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN || '');

// صحنه مرحله‌به‌مرحله افزودن کالا
const addProductWizard = new Scenes.WizardScene<BotContext>(
  'ADD_PRODUCT_SCENE',
  async (ctx) => {
    ctx.scene.session.productData = {};
    await ctx.reply('📦 مرحله ۱ از ۴: لطفاً *نام محصول* را وارد کنید:', { parse_mode: 'Markdown' });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('❌ نام نامعتبر است. لطفاً متن وارد کنید:');
      return;
    }
    ctx.scene.session.productData.name = ctx.message.text.trim();
    await ctx.reply('🔢 مرحله ۲ از ۴: *تعداد در بسته‌بندی* را وارد کنید (مثال: 12):', { parse_mode: 'Markdown' });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return;
    const qty = parseInt(ctx.message.text, 10);
    if (isNaN(qty) || qty <= 0) {
      await ctx.reply('❌ تعداد باید یک عدد مثبت باشد. مجدداً وارد کنید:');
      return;
    }
    ctx.scene.session.productData.quantityPerPackage = qty;
    await ctx.reply('💰 مرحله ۳ از ۴: *قیمت (به تومان)* را وارد کنید (مثال: 850000):', { parse_mode: 'Markdown' });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return;
    const price = parseFloat(ctx.message.text);
    if (isNaN(price) || price < 0) {
      await ctx.reply('❌ قیمت باید عدد نامنفی باشد. مجدداً وارد کنید:');
      return;
    }
    ctx.scene.session.productData.price = price;
    await ctx.reply('🏷 مرحله ۴ از ۴: *کد بارکد ۱۳ رقمی EAN-13* را وارد کنید:', { parse_mode: 'Markdown' });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return;
    const barcode = ctx.message.text.trim();

    if (!validateEan13Checksum(barcode)) {
      await ctx.reply('⚠️ بارکد واردشده ۱۳ رقمی استاندارد نیست یا رقم کنترل (Checksum) آن همخوانی ندارد. مجدداً وارد کنید:');
      return;
    }

    ctx.scene.session.productData.barcode = barcode;
    const p = ctx.scene.session.productData;

    // تولید پیش‌نمایش بارکد
    const bcBuffer = await BarcodeService.generatePngBuffer(barcode, 'ean13');

    await ctx.replyWithPhoto({ source: bcBuffer }, {
      caption: `📋 *تأیید نهایی اطلاعات کالا*\n\n` +
               `🔹 *نام کالا:* ${p.name}\n` +
               `🔹 *تعداد در بسته:* ${p.quantityPerPackage}\n` +
               `🔹 *قیمت:* ${Number(p.price).toLocaleString('fa-IR')} تومان\n` +
               `🔹 *بارکد:* \`${p.barcode}\`\n\n` +
               `آیا مشخصات مورد تأیید است؟`,
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('✅ ثبت در سیستم', 'CONFIRM_SAVE_PRODUCT')],
        [Markup.button.callback('❌ انصراف', 'CANCEL_PRODUCT_ENTRY')],
      ]),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      if (ctx.callbackQuery.data === 'CONFIRM_SAVE_PRODUCT') {
        const data = ctx.scene.session.productData;
        await prisma.product.create({
          data: {
            name: data.name!,
            quantityPerPackage: data.quantityPerPackage!,
            price: data.price!,
            barcode: data.barcode!,
            barcodeType: 'ean13',
          },
        });
        await ctx.editMessageCaption('✅ محصول با موفقیت در دیتابیس ثبت گردید.');
      } else {
        await ctx.editMessageCaption('❌ عملیات لغو شد.');
      }
    }
    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage<BotContext>([addProductWizard]);
bot.use(session());
bot.use(stage.middleware());

// منوی اصلی ربات
bot.start(async (ctx) => {
  const miniAppUrl = process.env.MINI_APP_URL || 'https://your-domain.com';
  await ctx.reply(
    `👋 به سامانه مدیریت محصولات و بارکد خوش آمدید.\nجهت مدیریت آسان و دیدن گرافیکی کاتالوگ روی دکمه مینی‌اپ کلیک کنید.`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 باز کردن مینی اپلیکیشن', miniAppUrl)],
      [Markup.button.callback('➕ ثبت سریع محصول جدید', 'BTN_ADD_PRODUCT')],
      [Markup.button.callback('📊 دانلود اکسل', 'BTN_EXPORT_EXCEL'), Markup.button.callback('📄 دانلود PDF', 'BTN_EXPORT_PDF')],
    ])
  );
});

bot.action('BTN_ADD_PRODUCT', (ctx) => ctx.scene.enter('ADD_PRODUCT_SCENE'));

bot.action('BTN_EXPORT_EXCEL', async (ctx) => {
  await ctx.answerCbQuery('در حال آماده‌سازی فایل اکسل...');
  const products = await prisma.product.findMany();
  const buffer = await ExcelService.generateProductsExcel(products.map(p => ({
    name: p.name,
    quantityPerPackage: p.quantityPerPackage,
    price: Number(p.price),
    barcode: p.barcode,
    barcodeType: p.barcodeType as any,
  })));
  await ctx.replyWithDocument({ source: buffer, filename: `products_${new Date().toISOString().split('T')[0]}.xlsx` });
});

bot.action('BTN_EXPORT_PDF', async (ctx) => {
  await ctx.answerCbQuery('در حال ساخت گزارش چاپی PDF...');
  const products = await prisma.product.findMany();
  const buffer = await PdfService.generateCatalogPdf(products.map(p => ({
    name: p.name,
    quantityPerPackage: p.quantityPerPackage,
    price: Number(p.price),
    barcode: p.barcode,
    barcodeType: p.barcodeType as any,
  })));
  await ctx.replyWithDocument({ source: buffer, filename: `catalog_${new Date().toISOString().split('T')[0]}.pdf` });
});

bot.launch().then(() => console.log('Bot is running successfully.'));