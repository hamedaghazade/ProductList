import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

app.use('/api', apiRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر درخواست‌شده وجود ندارد',
  });
});

app.use(errorHandler);

export default app;