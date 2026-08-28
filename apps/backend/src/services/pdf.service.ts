import puppeteer from 'puppeteer';
import { IProduct } from '@shared/types/product';
import { BarcodeService } from './barcode.service';

export class PdfExportService {
  public static async generateTablePdf(products: IProduct[]): Promise<Buffer> {
    const productsWithImages = await Promise.all(
      products.map(async (p, idx) => ({
        ...p,
        rowNumber: idx + 1,
        formattedPrice: Number(p.price).toLocaleString('fa-IR'),
        barcodeDataUrl: await BarcodeService.generateBase64DataUrl(p.barcode, p.barcodeType),
      }))
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
          * { box-sizing: border-box; font-family: 'Vazirmatn', Tahoma, sans-serif; }
          body { margin: 0; padding: 20px; font-size: 11pt; color: #1e293b; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 18pt; color: #0f172a; }
          .header p { margin: 5px 0 0; color: #64748b; font-size: 9pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f1f5f9; color: #334155; padding: 8px 6px; font-weight: 700; border: 1px solid #cbd5e1; font-size: 9pt; }
          td { padding: 6px; border: 1px solid #e2e8f0; text-align: center; vertical-align: middle; font-size: 9pt; }
          tr:nth-child(even) { background-color: #fafafa; }
          .barcode-img { max-width: 130px; height: 42px; object-fit: contain; }
          .barcode-num { font-family: 'Courier New', Courier, monospace; letter-spacing: 1px; font-weight: bold; }
          .footer { position: fixed; bottom: 10px; left: 20px; right: 20px; display: flex; justify-content: space-between; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>گزارش جامع فهرست محصولات و بارکد</h1>
          <p>تاریخ تولید گزارش: ${new Date().toLocaleDateString('fa-IR')} | تعداد اقلام: ${products.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">ردیف</th>
              <th style="width: 32%;">نام محصول</th>
              <th style="width: 12%;">تعداد در بسته</th>
              <th style="width: 18%;">قیمت (ریال)</th>
              <th style="width: 16%;">کد بارکد</th>
              <th style="width: 16%;">تصویر بارکد</th>
            </tr>
          </thead>
          <tbody>
            ${productsWithImages
              .map(
                (p) => `
              <tr>
                <td>${p.rowNumber}</td>
                <td style="text-align: right; padding-right: 8px; font-weight: 500;">${p.name}</td>
                <td>${p.quantityPerPackage}</td>
                <td>${p.formattedPrice}</td>
                <td class="barcode-num" dir="ltr">${p.barcode}</td>
                <td><img class="barcode-img" src="${p.barcodeDataUrl}" /></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    return this.renderHtmlToPdf(htmlContent, 'A4', false);
  }

  public static async generateLabelsPdf(products: IProduct[]): Promise<Buffer> {
    const productsWithImages = await Promise.all(
      products.map(async (p) => ({
        ...p,
        formattedPrice: Number(p.price).toLocaleString('fa-IR'),
        barcodeDataUrl: await BarcodeService.generateBase64DataUrl(p.barcode, p.barcodeType),
      }))
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
          * { box-sizing: border-box; font-family: 'Vazirmatn', Tahoma, sans-serif; }
          body { margin: 0; padding: 12mm 8mm; background: #fff; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
          .label-card {
            border: 1px dashed #94a3b8;
            border-radius: 4px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            height: 48mm;
            page-break-inside: avoid;
          }
          .product-title { font-size: 9pt; font-weight: bold; text-align: center; max-height: 2.4em; overflow: hidden; }
          .meta-row { display: flex; justify-content: space-between; width: 100%; font-size: 7.5pt; color: #475569; }
          .barcode-box { text-align: center; width: 100%; }
          .barcode-box img { width: 90%; height: 25mm; object-fit: contain; }
        </style>
      </head>
      <body>
        <div class="grid">
          ${productsWithImages
            .map(
              (p) => `
            <div class="label-card">
              <div class="product-title">${p.name}</div>
              <div class="meta-row">
                <span>بسته: <b>${p.quantityPerPackage} عددی</b></span>
                <span>قیمت: <b>${p.formattedPrice} ریال</b></span>
              </div>
              <div class="barcode-box">
                <img src="${p.barcodeDataUrl}" />
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </body>
      </html>
    `;

    return this.renderHtmlToPdf(htmlContent, 'A4', false);
  }

  private static async renderHtmlToPdf(html: string, format: 'A4' = 'A4', landscape = false): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format,
      landscape,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    await browser.close();
    return Buffer.from(pdfUint8Array);
  }
}