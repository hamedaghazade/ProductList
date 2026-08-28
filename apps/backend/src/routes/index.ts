import { Router } from 'express';
import productRoutes from './product.routes';
import exportRoutes from './export.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ProductService } from '../services/product.service';

const router = Router();
const productService = new ProductService();

router.use('/products', productRoutes);
router.use('/export', exportRoutes);

router.get('/summary', authMiddleware as any, async (req: any, res) => {
  try {
    const summary = await productService.getSummary(req.telegramUserId);
    return res.json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;