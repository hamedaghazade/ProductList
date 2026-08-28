import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  queryProductSchema,
} from '../validations/product.schema.js';

const router = Router();

router.get('/stats', productController.getStats);
router.get('/', validate(queryProductSchema), productController.getAll);
router.get('/:id', validate(getProductByIdSchema), productController.getById);
router.post('/', validate(createProductSchema), productController.create);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', validate(getProductByIdSchema), productController.delete);

export const productRoutes = router;