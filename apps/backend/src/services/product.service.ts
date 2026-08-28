import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { AppError, ConflictError, NotFoundError } from '../errors/app-error.js';

export interface CreateProductDTO {
  name: string;
  quantityPerPackage: number;
  price: number;
  barcode: string;
  barcodeType: 'EAN13' | 'CODE128';
}

export interface UpdateProductDTO {
  name?: string;
  quantityPerPackage?: number;
  price?: number;
  barcode?: string;
  barcodeType?: 'EAN13' | 'CODE128';
}

export interface ProductQueryFilter {
  page: number;
  limit: number;
  search?: string;
  sortBy: 'createdAt' | 'name' | 'price' | 'quantityPerPackage';
  sortOrder: 'asc' | 'desc';
}

export class ProductService {
  async createProduct(data: CreateProductDTO) {
    const existing = await prisma.product.findUnique({
      where: { barcode: data.barcode },
    });

    if (existing) {
      throw new ConflictError(`محصولی با بارکد «${data.barcode}» قبلاً ثبت شده است`);
    }

    return prisma.product.create({
      data: {
        name: data.name,
        quantityPerPackage: data.quantityPerPackage,
        price: new Prisma.Decimal(data.price),
        barcode: data.barcode,
        barcodeType: data.barcodeType,
      },
    });
  }

  async getAllProducts(filters: ProductQueryFilter) {
    const { page, limit, search, sortBy, sortOrder } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('محصول مورد نظر یافت نشد');
    }

    return product;
  }

  async getProductByBarcode(barcode: string) {
    const product = await prisma.product.findUnique({
      where: { barcode },
    });

    if (!product) {
      throw new NotFoundError(`محصولی با بارکد «${barcode}» یافت نشد`);
    }

    return product;
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundError('محصول جهت ویرایش یافت نشد');
    }

    if (data.barcode && data.barcode !== product.barcode) {
      const barcodeExists = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });
      if (barcodeExists) {
        throw new ConflictError('بارکد جدید وارد شده متعلق به محصول دیگری است');
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantityPerPackage !== undefined && { quantityPerPackage: data.quantityPerPackage }),
        ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
        ...(data.barcode && { barcode: data.barcode }),
        ...(data.barcodeType && { barcodeType: data.barcodeType }),
      },
    });
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundError('محصول جهت حذف یافت نشد');
    }

    await prisma.product.delete({ where: { id } });

    return { id, message: 'محصول با موفقیت حذف شد' };
  }

  async getDashboardStats() {
    const [totalProducts, latestProducts] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalProducts,
      latestProducts,
    };
  }
}

export const productService = new ProductService();