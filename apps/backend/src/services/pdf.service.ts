import PDFDocument from 'pdfkit';
import { BarcodeService } from './barcode.service';
import { ExportProductItem } from './excel.service';

export class PdfService {
  /**
   * ساخت PDF کاتالوگ و جدول رسمی محصولات
   */
  public static async generateCatalogPdf(products: ExportProductItem[]): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 30,
          info: { Title: 'گزارش محصولات', Author: 'ProductList Bot' },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // هدر صفحه
        doc.fontSize(16).text('فهرست و بارکد محصولات', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(9).text(`تاریخ صدور: ${new Date().toLocaleDateString('fa-IR')}`, { align: 'left' });
        doc.moveDown(1);

        let y = 100;
        const rowHeight = 65;

        // سرستون‌های جدول
        doc.rect(30, y, 535, 25).fill('#1E293B');
        doc.fillColor('#FFFFFF').fontSize(10);
        doc.text('تصویر بارکد', 40, y + 7, { width: 120, align: 'center' });
        doc.text('کد محصول', 170, y + 7, { width: 90, align: 'center' });
        doc.text('قیمت (تومان)', 270, y + 7, { width: 90, align: 'center' });
        doc.text('تعداد', 370, y + 7, { width: 40, align: 'center' });
        doc.text('نام کالا', 420, y + 7, { width: 140, align: 'right' });

        y += 25;
        doc.fillColor('#000000');

        for (let i = 0; i < products.length; i++) {
          const item = products[i];

          // کنترل صفحه جدید در صورت پر شدن برگه
          if (y + rowHeight > 780) {
            doc.addPage();
            y = 40;
          }

          // خط جداکننده سطر
          doc.rect(30, y, 535, rowHeight).stroke('#E2E8F0');

          // نام کالا
          doc.fontSize(10).text(item.name, 420, y + 20, { width: 135, align: 'right' });
          // تعداد
          doc.fontSize(10).text(String(item.quantityPerPackage), 370, y + 22, { width: 40, align: 'center' });
          // قیمت
          doc.fontSize(9).text(Number(item.price).toLocaleString('fa-IR'), 270, y + 22, { width: 90, align: 'center' });
          // بارکد متنی
          doc.fontSize(9).text(item.barcode, 170, y + 22, { width: 90, align: 'center' });

          // درج تصویر بارکد
          try {
            const bcBuffer = await BarcodeService.generatePngBuffer(item.barcode, item.barcodeType || 'ean13');
            doc.image(bcBuffer, 45, y + 8, { width: 110, height: 48 });
          } catch {
            doc.fontSize(8).fillColor('#EF4444').text('خطای بارکد', 50, y + 25);
            doc.fillColor('#000000');
          }

          y += rowHeight;
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * تولید شیت لیبل برچسب استاندارد A4 (شبکه ۳ ستون در ۸ ردیف = ۲۴ برچسب)
   */
  public static async generateLabelSheetPdf(products: ExportProductItem[]): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 20 });
        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const cols = 3;
        const colWidth = 180;
        const rowHeight = 95;
        const startX = 25;
        const startY = 25;

        let col = 0;
        let row = 0;

        for (const item of products) {
          if (row >= 8) {
            doc.addPage();
            col = 0;
            row = 0;
          }

          const x = startX + col * (colWidth + 10);
          const y = startY + row * (rowHeight + 5);

          // کادر پیرامون هر لیبل
          doc.roundedRect(x, y, colWidth, rowHeight, 4).lineWidth(0.5).stroke('#CBD5E1');

          // عنوان و مشخصات محصول روی لیبل
          doc.fontSize(9).fillColor('#0F172A').text(item.name, x + 5, y + 6, { width: colWidth - 10, align: 'center', height: 12 });
          doc.fontSize(8).fillColor('#475569').text(`قیمت: ${Number(item.price).toLocaleString('fa-IR')} تومان`, x + 5, y + 20, { width: colWidth - 10, align: 'center' });

          // تولید بارکد لیبل
          try {
            const bcBuffer = await BarcodeService.generatePngBuffer(item.barcode, item.barcodeType || 'ean13');
            doc.image(bcBuffer, x + 15, y + 34, { width: colWidth - 30, height: 48 });
          } catch {
            doc.fontSize(8).fillColor('#EF4444').text('خطای بارکد', x + 5, y + 45, { align: 'center' });
          }

          col++;
          if (col >= cols) {
            col = 0;
            row++;
          }
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}