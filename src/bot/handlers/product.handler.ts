import { Context } from 'telegraf';
import { botConfig } from '../config/bot.config';

export class ProductHandler {
  private readonly defaultPageSize: number;

  constructor() {
    this.defaultPageSize = botConfig.itemsPerPage;
  }

  public async listProducts(ctx: Context, page: number = 1): Promise<void> {
    const limit = botConfig.itemsPerPage;
    const offset = (page - 1) * limit;

    // لاجیک دریافت محصولات از دیتابیس با limit و offset
    await ctx.reply(`نمایش صفحه ${page} با ظرفیت هر صفحه: ${limit} محصول`);
  }
}