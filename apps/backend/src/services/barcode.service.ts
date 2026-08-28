import bwipjs from 'bwip-js';
import { BarcodeType, validateEan13Checksum } from '@shared/validators/product.schema';

export class BarcodeService {
  /**
   * تولید بافر تصویر PNG بارکد با رزولوشن چاپ
   */
  public static async generatePngBuffer(
    text: string,
    type: BarcodeType = 'ean13'
  ): Promise<Buffer> {
    if (type === 'ean13' && !validateEan13Checksum(text)) {
      throw new Error(`بارکد واردشده (${text}) دارای فرمت یا رقم کنترل نامعتبر EAN-13 است.`);
    }

    try {
      const buffer = await bwipjs.toBuffer({
        bcid: type === 'ean13' ? 'ean13' : 'code128',
        text: text,
        scale: 4,               // مقیاس بالا جهت شفافیت در پرینتر لیبل
        height: 14,             // ارتفاع خطوط به میلی‌متر
        includetext: true,      // نمایش ارقام در زیر بارکد
        textxalign: 'center',
        textsize: 10,
        backgroundcolor: 'ffffff',
        paddingwidth: 4,
        paddingheight: 4,
      });
      return buffer;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`خطا در پردازش تصویر بارکد: ${msg}`);
    }
  }

  /**
   * تولید رشته Data URL برای استفاده مستقیم در تگ <img> وب‌اپلیکیشن
   */
  public static async generateBase64DataUrl(
    text: string,
    type: BarcodeType = 'ean13'
  ): Promise<string> {
    const buffer = await this.generatePngBuffer(text, type);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
}