import bwipjs from 'bwip-js';

export class BarcodeService {
  public static async generateBarcodeBuffer(text: string, type: 'EAN13' | 'CODE128' = 'CODE128'): Promise<Buffer> {
    const bcid = type === 'EAN13' ? 'ean13' : 'code128';
    
    return bwipjs.toBuffer({
      bcid: bcid,
      text: text,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });
  }
}