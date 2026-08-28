import bwipjs from 'bwip-js';
import { BarcodeType } from '@shared/types/product';

export class BarcodeService {
  public static async generatePngBuffer(
    text: string,
    type: BarcodeType,
    scale: number = 3,
    height: number = 10
  ): Promise<Buffer> {
    const bcid = type === BarcodeType.EAN13 ? 'ean13' : 'code128';

    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid,
          text,
          scale,
          height,
          includetext: true,
          textxalign: 'center',
          textsize: 10,
          backgroundcolor: 'FFFFFF',
        },
        (err, pngBuffer) => {
          if (err) {
            reject(new Error(`خطا در ایجاد بارکد: ${err.message}`));
          } else {
            resolve(pngBuffer);
          }
        }
      );
    });
  }

  public static async generateSvgString(text: string, type: BarcodeType): Promise<string> {
    const bcid = type === BarcodeType.EAN13 ? 'ean13' : 'code128';

    return bwipjs.toSVG({
      bcid,
      text,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
  }

  public static async generateBase64DataUrl(text: string, type: BarcodeType): Promise<string> {
    const buffer = await this.generatePngBuffer(text, type);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
}