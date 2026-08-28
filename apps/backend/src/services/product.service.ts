import { PrismaClient } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO, ProductQueryParams, PaginatedResult, IProduct } from '@shared/types/product';

const prisma = new PrismaClient();

export class ProductService {
  public async findAll(telegramUserId: string, query: ProductQueryParams): Promise<PaginatedResult<IProduct>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const whereClause: any = { telegramUserId };

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search } },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [total, records] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    const items: IProduct[] = records.map((r) => ({
      ...r,
      price: Number(r.price),
      barcodeType: r.barcodeType as any,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getSummary(telegramUserId: string) {
    const totalProducts = await prisma.product.count({ where: { telegramUserId } });
    const aggregate = await prisma.product.aggregate({
      where: { telegramUserId },
      _sum: { quantityPerPackage: true },
    });

    return {
      totalProducts,
      totalItemsCount: aggregate._sum.quantityPerPackage || 0,
    };
  }

  public async findByIds(telegramUserId: string, ids?: string[]): Promise<IProduct[]> {
    const where: any = { telegramUserId };
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    const records = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      ...r,
      price: Number(r.price),
      barcodeType: r.barcodeType as any,
    }));
  }

  public async create(telegramUserId: string, data: CreateProductDTO): Promise<IProduct> {
    const created = await prisma.product.create({
      data: {
        name: data.name,
        quantityPerPackage: data.quantityPerPackage,
        price: data.price,
        barcode: data.barcode,
        barcodeType: data.barcodeType as any,
        telegramUserId,
      },
    });

    return {
      ...created,
      price: Number(created.price),
      barcodeType: created.barcodeType as any,
    };
  }

  public async update(telegramUserId: string, id: string, data: UpdateProductDTO): Promise<IProduct> {
    const updated = await prisma.product.update({
      where: { id, telegramUserId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantityPerPackage !== undefined && { quantityPerPackage: data.quantityPerPackage }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.barcode && { barcode: data.barcode }),
        ...(data.barcodeType && { barcodeType: data.barcodeType as any }),
      },
    });

    return {
      ...updated,
      price: Number(updated.price),
      barcodeType: updated.barcodeType as any,
    };
  }

  public async delete(telegramUserId: string, id: string): Promise<void> {
    await prisma.product.delete({
      where: { id, telegramUserId },
    });
  }
}