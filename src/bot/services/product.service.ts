export interface Product {
  id: string;
  name: string;
  quantityPerPackage: number;
  price: number;
  barcode: string;
  barcodeType: 'EAN13' | 'CODE128';
  createdAt: Date;
}

// در صورت استفاده از Prisma Client این بخش مستقیماً با db ارتباط برقرار می‌کند.
export class ProductService {
  private static products: Product[] = []; // حافظه موقت برای شبیه‌سازی / جایگزینی با Prisma

  public static async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const exists = this.products.some((p) => p.barcode === data.barcode);
    if (exists) {
      throw new Error('محصولی با این بارکد قبلاً ثبت شده است.');
    }

    const newProduct: Product = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      createdAt: new Date(),
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  public static async findMany(page = 1, limit = 5): Promise<{ items: Product[]; total: number }> {
    const start = (page - 1) * limit;
    const items = this.products.slice(start, start + limit);
    return { items, total: this.products.length };
  }

  public static async search(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    return this.products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q)
    );
  }

  public static async delete(id: string): Promise<boolean> {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < initialLen;
  }

  public static async getAll(): Promise<Product[]> {
    return [...this.products];
  }
}