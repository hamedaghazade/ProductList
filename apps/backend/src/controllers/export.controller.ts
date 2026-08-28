import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ProductService } from '../services/product.service';
import { ExcelExportService } from '../services/excel.service';
import { PdfExportService } from '../services/pdf.service';

export class ExportController {
  private productService = new ProductService();

  public exportExcel = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const ids = req.query.ids ? (req.query.ids as string).split(',') : undefined;
      const products = await this.productService.findByIds(telegramUserId, ids);

      if (products.length === 0) {
        return res.status(400).json({ success: false, message: 'هیچ کالایی جهت خروجی یافت نشد.' });
      }

      const buffer = await ExcelExportService.generateProductsWorkbook(products);
      const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  public exportPdf = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const mode = (req.query.mode as string) || 'table';
      const ids = req.query.ids ? (req.query.ids as string).split(',') : undefined;
      const products = await this.productService.findByIds(telegramUserId, ids);

      if (products.length === 0) {
        return res.status(400).json({ success: false, message: 'هیچ کالایی جهت خروجی یافت نشد.' });
      }

      const buffer =
        mode === 'label'
          ? await PdfExportService.generateLabelsPdf(products)
          : await PdfExportService.generateTablePdf(products);

      const filename = `products_${mode}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}