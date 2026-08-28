import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { BotContext } from '../types/context.interface';
import { ProductService } from '../services/product.service';
import { BarcodeService } from '../services/barcode.service';
import { formatPrice } from '../utils/validators';

export async function handleExcelExport(ctx: BotContext) {
  const products = await ProductService.getAll();
  if (products.length === 0) {
    await ctx.reply('⚠️ داده‌ای برای خروجی اکسل وجود ندارد.');
    return;
  }

  const loadingMsg = await ctx.reply('⏳ در حال آماده‌سازی و ساخت فایل Excel...');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('لیست محصولات', {
    views: [{ rightToLeft: true }],
  });

  worksheet.columns = [
    { header: 'ردیف', key: 'rowNumber', width: 8 },
    { header: 'نام محصول', key: 'name', width: 25 },
    { header: 'تعداد در بسته', key: 'quantityPerPackage', width: 16 },
    { header: 'قیمت (ریال)', key: 'price', width: 18 },
    { header: 'کد بارکد', key: 'barcode', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  products.forEach((p, index) => {
    worksheet.addRow({
      rowNumber: index + 1,
      name: p.name,
      quantityPerPackage: p.quantityPerPackage,
      price: p.price,
      barcode: p.barcode,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `products_${new Date().toISOString().split('T')[0]}.xlsx`;

  await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
  await ctx.replyWithDocument(
    { source: Buffer.from(buffer), filename: fileName },
    { caption: '📊 فایل اکسل محصولات' }
  );
}

export async function handlePdfExport(ctx: BotContext) {
  const products = await ProductService.getAll();
  if (products.length === 0) {
    await ctx.reply('⚠️ داده‌ای برای خروجی PDF وجود ندارد.');
    return;
  }

  const loadingMsg = await ctx.reply('⏳ در حال آماده‌سازی و ساخت فایل PDF...');

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(16).text('Product List Report', { align: 'center' });
  doc.moveDown();

  products.forEach((item, index) => {
    doc.fontSize(11).text(
      `${index + 1}. ${item.name} | Qty: ${item.quantityPerPackage} | Price: ${item.price} | Barcode: ${item.barcode}`
    );
  });

  doc.end();

  await new Promise((resolve) => doc.on('end', resolve));
  const pdfBuffer = Buffer.concat(chunks);
  const fileName = `products_${new Date().toISOString().split('T')[0]}.pdf`;

  await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
  await ctx.replyWithDocument(
    { source: pdfBuffer, filename: fileName },
    { caption: '📄 فایل PDF محصولات' }
  );
}