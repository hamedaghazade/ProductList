import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 سرور با موفقیت روی پورت ${env.PORT} در حالت [${env.NODE_ENV}] اجرا شد.`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nدریافت سیگنال ${signal}. در حال توقف سرور...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('ارتباط با دیتابیس قطع شد. خروج کامل.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));