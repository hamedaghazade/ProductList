import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ExportController();

router.use(authMiddleware as any);

router.get('/excel', controller.exportExcel as any);
router.get('/pdf', controller.exportPdf as any);

export default router;