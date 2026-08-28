import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'محصول با موفقیت ثبت شد',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string | undefined,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      const result = await productService.getAllProducts(filters);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'محصول با موفقیت به‌روزرسانی شد',
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { id: result.id },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await productService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
export default productController;