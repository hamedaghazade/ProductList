import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/async-handler';
import { exportLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();
const controller = new ExportController();

router.use(authMiddleware as any);
router.use(exportLimiter);

router.get('/excel', asyncHandler(controller.exportExcel as any));
router.get('/pdf', asyncHandler(controller.exportPdf as any));

export default router;
