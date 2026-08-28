import ExcelJS from 'exceljs';
import bwipjs from 'bwip-js';

export interface ExportProductItem {
  id?: number | string;
  name: string;
  quantityPerPackage: number;
  price: number;
  barcode: string;
  barcodeType?: 'ean13' | 'code128';
}

export class ExcelService {
  private static async generateBarcodeBuffer(
    text: string,
    bcid: 'ean13' | 'code128' = 'code128'
  ): Promise<Buffer> {
    return bwipjs.toBuffer({
      bcid: bcid === 'ean13' ? 'ean13' : 'code128',
      text: text,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
      backgroundcolor: 'ffffff',
    });
  }

  public static async generateProductsExcel(
    products: ExportProductItem[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProductList';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('لیست محصولات', {
      views: [{ rightToLeft: true }],
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // ساختار ستون‌ها
    worksheet.columns = [
      { header: 'ردیف', key: 'rowNum', width: 8 },
      { header: 'نام محصول', key: 'name', width: 34 },
      { header: 'تعداد در بسته', key: 'quantity', width: 16 },
      { header: 'قیمت (تومان)', key: 'price', width: 22 },
      { header: 'بارکد عددی', key: 'barcode', width: 24 },
      { header: 'تصویر بارکد', key: 'barcodeImage', width: 30 },
    ];

    // استایل هدر جدول
    const headerRow = worksheet.getRow(1);
    headerRow.height = 34;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 11,
        name: 'Tahoma',
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    });

    // درج داده‌ها و ساخت بارکد برای هر سطر
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const currentRowIndex = i + 2;

      const row = worksheet.addRow({
        rowNum: i + 1,
        name: item.name,
        quantity: item.quantityPerPackage,
        price: Number(item.price).toLocaleString('fa-IR'),
        barcode: item.barcode,
        barcodeImage: '',
      });

      row.height = 60; // ارتفاع مناسب برای قرارگیری بارکد

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'right' : 'center',
        };
        cell.font = {
          size: 10,
          name: 'Tahoma',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });

      // الصاق تصویر بارکد در سلول مربوطه
      if (item.barcode && item.barcode.trim().length > 0) {
        try {
          const bcType = item.barcodeType || (item.barcode.length === 13 ? 'ean13' : 'code128');
          const rawBarcodeBuffer = await this.generateBarcodeBuffer(item.barcode, bcType);

          const imageId = workbook.addImage({
            buffer: rawBarcodeBuffer as unknown as ExcelJS.Buffer,
            extension: 'png',
          });

          worksheet.addImage(imageId, {
            tl: { col: 5 + 0.1, row: currentRowIndex - 1 + 0.1 },
            br: { col: 6 - 0.1, row: currentRowIndex - 0.1 },
            editAs: 'oneCell',
          });
        } catch {
          const barcodeCell = row.getCell(6);
          barcodeCell.value = 'بارکد نامعتبر';
          barcodeCell.font = { color: { argb: 'FFEF4444' }, size: 9 };
        }
      }
    }

    const outputBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(outputBuffer);
  }
}