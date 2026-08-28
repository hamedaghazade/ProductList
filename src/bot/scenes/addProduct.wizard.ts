import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotContext } from '../types/context.interface';
import { validateProductName, validateQuantity, validatePrice, validateBarcode, formatPrice } from '../utils/validators';
import { cancelWizardKeyboard, confirmAddProductKeyboard, mainReplyKeyboard } from '../keyboards/bot.keyboards';
import { BarcodeService } from '../services/barcode.service';
import { ProductService } from '../services/product.service';

export const addProductWizard = new Scenes.WizardScene<BotContext>(
  'ADD_PRODUCT_WIZARD_SCENE',
  
  // مرحله ۱: دریافت نام محصول
  async (ctx) => {
    ctx.scene.session.productData = {};
    await ctx.reply('🔹 لطفاً **نام محصول** را وارد کنید:', {
      parse_mode: 'Markdown',
      ...cancelWizardKeyboard,
    });
    return ctx.wizard.next();
  },

  // مرحله ۲: اعتبارسنجی نام و درخواست تعداد در بسته
  async (ctx) => {
    if (!ctx.has(message('text'))) {
      await ctx.reply('⚠️ لطفاً فقط متن ارسال کنید.');
      return;
    }
    const text = ctx.message.text;
    if (text === '❌ انصراف') {
      await ctx.reply('عملیات ثبت محصول لغو شد.', mainReplyKeyboard);
      return ctx.scene.leave();
    }

    const validation = validateProductName(text);
    if (!validation.isValid) {
      await ctx.reply(`⚠️ ${validation.error}`);
      return;
    }

    ctx.scene.session.productData.name = validation.value;
    await ctx.reply('🔹 **تعداد در بسته‌بندی** را به عدد وارد کنید (مثال: 12):', {
      parse_mode: 'Markdown',
    });
    return ctx.wizard.next();
  },

  // مرحله ۳: اعتبارسنجی تعداد و درخواست قیمت
  async (ctx) => {
    if (!ctx.has(message('text'))) return;
    const text = ctx.message.text;
    if (text === '❌ انصراف') {
      await ctx.reply('عملیات ثبت محصول لغو شد.', mainReplyKeyboard);
      return ctx.scene.leave();
    }

    const validation = validateQuantity(text);
    if (!validation.isValid) {
      await ctx.reply(`⚠️ ${validation.error}`);
      return;
    }

    ctx.scene.session.productData.quantityPerPackage = validation.value;
    await ctx.reply('🔹 **قیمت واحد محصول** را به ریال وارد کنید (مثال: 850000):', {
      parse_mode: 'Markdown',
    });
    return ctx.wizard.next();
  },

  // مرحله ۴: اعتبارسنجی قیمت و درخواست بارکد عددی
  async (ctx) => {
    if (!ctx.has(message('text'))) return;
    const text = ctx.message.text;
    if (text === '❌ انصراف') {
      await ctx.reply('عملیات ثبت محصول لغو شد.', mainReplyKeyboard);
      return ctx.scene.leave();
    }

    const validation = validatePrice(text);
    if (!validation.isValid) {
      await ctx.reply(`⚠️ ${validation.error}`);
      return;
    }

    ctx.scene.session.productData.price = validation.value;
    await ctx.reply('🔹 **کد بارکد** را وارد کنید (مثال: 6261234567890):', {
      parse_mode: 'Markdown',
    });
    return ctx.wizard.next();
  },

  // مرحله ۵: اعتبارسنجی بارکد، تولید پیش‌نمایش بارکد و تأیید نهایی
  async (ctx) => {
    if (!ctx.has(message('text'))) return;
    const text = ctx.message.text;
    if (text === '❌ انصراف') {
      await ctx.reply('عملیات ثبت محصول لغو شد.', mainReplyKeyboard);
      return ctx.scene.leave();
    }

    const isEan13 = /^\d{13}$/.test(text.trim());
    const barcodeType = isEan13 ? 'EAN13' : 'CODE128';
    const validation = validateBarcode(text, barcodeType);

    if (!validation.isValid || !validation.value) {
      await ctx.reply(`⚠️ ${validation.error}`);
      return;
    }

    ctx.scene.session.productData.barcode = validation.value.barcode;
    ctx.scene.session.productData.barcodeType = validation.value.type;

    const data = ctx.scene.session.productData;

    try {
      const barcodeBuffer = await BarcodeService.generateBarcodeBuffer(data.barcode!, data.barcodeType);

      const summary = 
        `📋 **پیش‌نمایش اطلاعات محصول:**\n\n` +
        `▫️ **نام محصول:** ${data.name}\n` +
        `▫️ **تعداد در بسته:** ${data.quantityPerPackage}\n` +
        `▫️ **قیمت:** ${formatPrice(data.price!)}\n` +
        `▫️ **بارکد:** \`${data.barcode}\` (${data.barcodeType})\n\n` +
        `آیا اطلاعات فوق مورد تأیید است؟`;

      await ctx.replyWithPhoto(
        { source: barcodeBuffer },
        {
          caption: summary,
          parse_mode: 'Markdown',
          ...confirmAddProductKeyboard,
        }
      );
    } catch (err) {
      await ctx.reply('⚠️ تولید تصویر بارکد با این شناسه با خطا مواجه شد. لطفاً بارکد را بررسی کنید.');
      return;
    }

    return ctx.wizard.next();
  },

  // مرحله ۶: پردازش اکشن‌های دکمه شیشه‌ای (Inline)
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply('لطفاً از دکمه‌های شیشه‌ای زیر تصویر برای تأیید یا لغو استفاده کنید.');
      return;
    }

    const action = ctx.callbackQuery.data;
    await ctx.answerCbQuery();

    if (action === 'confirm_save_product') {
      const data = ctx.scene.session.productData;
      try {
        await ProductService.create({
          name: data.name!,
          quantityPerPackage: data.quantityPerPackage!,
          price: data.price!,
          barcode: data.barcode!,
          barcodeType: data.barcodeType!,
        });

        await ctx.reply('✅ محصول با موفقیت در سیستم ثبت شد.', mainReplyKeyboard);
      } catch (error: any) {
        await ctx.reply(`❌ خطا در ذخیره محصول: ${error.message || 'خطای ناشناخته'}`, mainReplyKeyboard);
      }
      return ctx.scene.leave();
    }

    if (action === 'cancel_save_product') {
      await ctx.reply('عملیات ثبت محصول لغو شد.', mainReplyKeyboard);
      return ctx.scene.leave();
    }
  }
);