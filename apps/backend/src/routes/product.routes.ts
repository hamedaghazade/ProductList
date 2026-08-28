import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ProductController();

router.use(authMiddleware as any);

router.get('/', controller.getAll as any);
router.post('/', controller.create as any);
router.put('/:id', controller.update as any);
router.delete('/:id', controller.delete as any);

export default router;