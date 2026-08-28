import { Router } from 'express';
import { productRoutes } from './product.routes.js';

const router = Router();

router.use('/products', productRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const apiRoutes = router;