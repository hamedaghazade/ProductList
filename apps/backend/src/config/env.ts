import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../../.env' });
dotenv.config();

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    BOT_TOKEN: z.string().min(1),
    TELEGRAM_WEBAPP_URL: z.string().url(),
    PUPPETEER_EXECUTABLE_PATH: z.string().min(1).optional(),
    ALLOW_DEV_AUTH_BYPASS: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== 'development' && value.ALLOW_DEV_AUTH_BYPASS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ALLOW_DEV_AUTH_BYPASS'],
        message: 'ALLOW_DEV_AUTH_BYPASS فقط در محیط development مجاز است.',
      });
    }
  });

export const env = EnvSchema.parse(process.env);
