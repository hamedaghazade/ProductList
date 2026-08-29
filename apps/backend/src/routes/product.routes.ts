import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async-handler';

const router = Router();
const controller = new ProductController();

router.use(authMiddleware as any);

router.get('/', asyncHandler(controller.getAll as any));
router.post('/', asyncHandler(controller.create as any));
router.put('/:id', asyncHandler(controller.update as any));
router.delete('/:id', asyncHandler(controller.delete as any));

export default router;
