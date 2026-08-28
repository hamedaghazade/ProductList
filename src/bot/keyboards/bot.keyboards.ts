import { Markup } from 'telegraf';
import { botConfig } from '../config/bot.config';

export const mainReplyKeyboard = Markup.keyboard([
  ['📦 لیست محصولات', '➕ ثبت محصول جدید'],
  ['🔍 جستجوی محصول', '📊 خروجی Excel'],
  ['📄 خروجی PDF', '🚀 باز کردن Mini App'],
  ['ℹ️ راهنما']
]).resize();

export const openMiniAppInlineKeyboard = Markup.inlineKeyboard([
  Markup.button.webApp('🚀 ورود به پنل تحت وب (Mini App)', botConfig.webAppUrl)
]);

export const cancelWizardKeyboard = Markup.keyboard([
  ['❌ انصراف']
]).resize();

export const confirmAddProductKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('✅ تأیید و ذخیره نهایی', 'confirm_save_product'),
    Markup.button.callback('❌ لغو عملیات', 'cancel_save_product')
  ]
]);

export const productItemActionsKeyboard = (productId: string) => Markup.inlineKeyboard([
  [
    Markup.button.callback('🗑️ حذف محصول', `delete_prod_${productId}`)
  ]
]);

export const paginationKeyboard = (currentPage: number, totalPages: number) => {
  const buttons = [];
  if (currentPage > 1) {
    buttons.push(Markup.button.callback('◀️ صفحه قبل', `page_${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    buttons.push(Markup.button.callback('صفحه بعد ▶️', `page_${currentPage + 1}`));
  }
  return Markup.inlineKeyboard([buttons]);
};