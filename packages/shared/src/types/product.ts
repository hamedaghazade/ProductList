export enum BarcodeType {
  EAN13 = 'EAN13',
  CODE128 = 'CODE128'
}

export interface IProduct {
  id: string;
  name: string;
  quantityPerPackage: number;
  price: number;
  barcode: string;
  barcodeType: BarcodeType;
  telegramUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductDTO = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductDTO = Partial<Omit<IProduct, 'id' | 'telegramUserId' | 'createdAt' | 'updatedAt'>>;

export interface ProductQueryParams {
  search?: string;
  sortBy?: 'name' | 'price' | 'quantityPerPackage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsSummary {
  totalProducts: number;
  totalItemsCount: number;
}