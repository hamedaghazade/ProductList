import { Scenes, Markup } from 'telegraf';
import { BarcodeType } from '@shared/types/product';
import { isValidEAN13 } from '@shared/validators/product.schema';
import { ProductService } from '../../services/product.service';
import { BarcodeService } from '../../services/barcode.service';

interface AddProductSession extends Scenes.WizardSessionData {
  productData: {
    name?: string;
    quantityPerPackage?: number;
    price?: number;
    barcode?: string;
    barcodeType?: BarcodeType;
  };
}

export const addProductWizard = new Scenes.WizardScene<Scenes.WizardContext<AddProductSession>>(
  'ADD_PRODUCT_SCENE',
  async (ctx) => {
    ctx.scene.session.productData = {};
    await ctx.reply('🔹 مرحله ۱ از ۴:\nلطفاً **نام کالا** را وارد کنید:', Markup.removeKeyboard());
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('⚠️ لطفاً نام محصول را به صورت متنی وارد کنید:');
      return;
    }
    const name = ctx.message.text.trim();
    if (name.length < 2) {
      await ctx.reply('⚠️ نام کالا باید حداقل ۲ حرف باشد. مجدداً ارسال کنید:');
      return;
    }

    ctx.scene.session.productData.name = name;
    await ctx.reply('🔹 مرحله ۲ از ۴:\n**تعداد در هر بسته** را به عدد وارد کنید:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('⚠️ لطفاً یک مقدار عددی ارسال فرمایید:');
      return;
    }
    const qty = parseInt(ctx.message.text.trim(), 10);
    if (isNaN(qty) || qty <= 0) {
      await ctx.reply('⚠️ تعداد باید یک عدد صحیح بزرگتر از صفر باشد:');
      return;
    }

    ctx.scene.session.productData.quantityPerPackage = qty;
    await ctx.reply('🔹 مرحله ۳ از ۴:\n**قیمت واحد محصول (ریال)** را وارد کنید:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('⚠️ قیمت باید عددی باشد:');
      return;
    }
    const price = parseFloat(ctx.message.text.trim());
    if (isNaN(price) || price < 0) {
      await ctx.reply('⚠️ قیمت نمی‌تواند منفی باشد. مجدداً وارد فرمایید:');
      return;
    }

    ctx.scene.session.productData.price = price;
    await ctx.reply(
      '🔹 مرحله ۴ از ۴:\n**کد بارکد** را وارد کنید (۱۳ رقم برای EAN-13 یا فرمت متنی برای Code 128):'
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('⚠️ بارکد معتبر ارسال فرمایید:');
      return;
    }
    const barcode = ctx.message.text.trim();
    let barcodeType = BarcodeType.CODE128;

    if (/^\d{13}$/.test(barcode)) {
      if (!isValidEAN13(barcode)) {
        await ctx.reply('⚠️ رقم کنترلی بارکد EAN-13 نامعتبر است. مجدداً بررسی و ارسال فرمایید:');
        return;
      }
      barcodeType = BarcodeType.EAN13;
    }

    const { productData } = ctx.scene.session;
    productData.barcode = barcode;
    productData.barcodeType = barcodeType;

    const summary =
      `📋 **پیش‌نمایش اطلاعات ثبت‌شده کالا:**\n\n` +
      `🏷 **نام:** ${productData.name}\n` +
      `📦 **تعداد در بسته:** ${productData.quantityPerPackage}\n` +
      `💰 **قیمت:** ${productData.price?.toLocaleString('fa-IR')} ریال\n` +
      `🔢 **بارکد:** \`${productData.barcode}\` (${barcodeType})\n\n` +
      `آیا اطلاعات مورد تایید شماست؟`;

    const pngBuffer = await BarcodeService.generatePngBuffer(barcode, barcodeType);

    await ctx.replyWithPhoto(
      { source: pngBuffer },
      {
        caption: summary,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ تأیید و ثبت نهایی', 'CONFIRM_SAVE_PRODUCT')],
          [Markup.button.callback('❌ انصراف', 'CANCEL_SAVE_PRODUCT')],
        ]),
      }
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      const action = ctx.callbackQuery.data;
      const telegramUserId = ctx.from!.id.toString();

      if (action === 'CONFIRM_SAVE_PRODUCT') {
        const productService = new ProductService();
        try {
          await productService.create(telegramUserId, ctx.scene.session.productData as any);
          await ctx.answerCbQuery('کالا ثبت گردید.');
          await ctx.reply('🎉 محصول با موفقیت در پایگاه داده ذخیره شد.');
        } catch (err: any) {
          await ctx.reply(`⚠️ خطا در ثبت کالا: ${err.message}`);
        }
      } else {
        await ctx.answerCbQuery('عملیات لغو شد.');
        await ctx.reply('❌ عملیات ثبت کالا لغو گردید.');
      }
      return ctx.scene.leave();
    }
  }
);