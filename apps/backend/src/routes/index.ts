import { Router } from 'express';
import productRoutes from './product.routes';
import exportRoutes from './export.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ProductService } from '../services/product.service';
import { asyncHandler } from '../middlewares/async-handler';

const router = Router();
const productService = new ProductService();

router.use('/products', productRoutes);
router.use('/export', exportRoutes);

router.get('/summary', authMiddleware as any, asyncHandler(async (req: any, res) => {
  const summary = await productService.getSummary(req.telegramUserId);
  return res.json({ success: true, data: summary });
}));

export default router;
