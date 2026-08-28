import ExcelJS from 'exceljs';
import { IProduct } from '@shared/types/product';
import { BarcodeService } from './barcode.service';

export class ExcelExportService {
  public static async generateProductsWorkbook(products: IProduct[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProductList System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('لیست محصولات', {
      views: [{ rightToLeft: true }],
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    sheet.columns = [
      { header: 'ردیف', key: 'row_idx', width: 8 },
      { header: 'نام محصول', key: 'name', width: 30 },
      { header: 'تعداد در بسته', key: 'quantity', width: 16 },
      { header: 'قیمت (ریال)', key: 'price', width: 22 },
      { header: 'بارکد عددی', key: 'barcode', width: 22 },
      { header: 'تصویر بارکد', key: 'barcode_img', width: 26 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const rowNumber = i + 2;
      const row = sheet.getRow(rowNumber);
      row.height = 65;

      row.getCell(1).value = i + 1;
      row.getCell(2).value = product.name;
      row.getCell(3).value = product.quantityPerPackage;
      row.getCell(4).value = Number(product.price);
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).value = product.barcode.toString();
      row.getCell(5).numFmt = '@';

      for (let col = 1; col <= 5; col++) {
        const cell = row.getCell(col);
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        };
      }

      try {
        const pngBuffer = await BarcodeService.generatePngBuffer(product.barcode, product.barcodeType, 2, 8);
        const imageId = workbook.addImage({
          buffer: pngBuffer,
          extension: 'png',
        });

        sheet.addImage(imageId, {
          tl: { col: 5.1, row: rowNumber - 0.85 },
          ext: { width: 140, height: 50 },
          editAs: 'oneCell',
        });
      } catch {
        row.getCell(6).value = 'خطا در رندر';
      }
    }

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }
}