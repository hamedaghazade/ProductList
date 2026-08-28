import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ProductService } from '../services/product.service';
import { productSchema } from '@shared/validators/product.schema';

export class ProductController {
  private productService = new ProductService();

  public getAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const { search, sortBy, sortOrder, page, limit } = req.query;

      const result = await this.productService.findAll(telegramUserId, {
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const validatedData = productSchema.parse(req.body);

      const createdProduct = await this.productService.create(telegramUserId, validatedData);
      return res.status(201).json({ success: true, data: createdProduct });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'محصولی با این شماره بارکد قبلاً در سیستم شما ثبت شده است.',
        });
      }
      return res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const { id } = req.params;
      const validatedData = productSchema.partial().parse(req.body);

      const updated = await this.productService.update(telegramUserId, id, validatedData);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const telegramUserId = req.telegramUserId!;
      const { id } = req.params;

      await this.productService.delete(telegramUserId, id);
      return res.json({ success: true, message: 'محصول با موفقیت حذف شد.' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}