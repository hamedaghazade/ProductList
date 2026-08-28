import React, { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/products/ProductCard';
import { ProductForm } from '../components/products/ProductForm';
import { Modal } from '../components/ui/Modal';
import { IProduct } from '@shared/types/product';
import { Search, Plus } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { productsQuery, createMutation, updateMutation, deleteMutation } = useProducts(search);
  const { haptic } = useTelegram();

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      haptic.success();
      setIsAddOpen(false);
    } catch (err: any) {
      haptic.error();
      alert(err.response?.data?.message || 'خطا در ثبت کالا');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProduct) return;
    try {
      await updateMutation.mutateAsync({ id: editingProduct.id, data });
      haptic.success();
      setEditingProduct(null);
    } catch (err: any) {
      haptic.error();
      alert(err.response?.data?.message || 'خطا در ویرایش کالا');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      haptic.impact('heavy');
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto pb-24" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">فهرست محصولات</h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>کالای جدید</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="جستجوی نام یا بارکد کالا..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      <div className="flex flex-col gap-3">
        {productsQuery.isLoading ? (
          <div className="text-center py-10 text-xs text-slate-400">در حال دریافت فهرست کالاها...</div>
        ) : productsQuery.data?.items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">کالایی یافت نشد.</div>
        ) : (
          productsQuery.data?.items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => setEditingProduct(p)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* مودال ثبت کالا */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="ثبت کالای جدید">
        <ProductForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
      </Modal>

      {/* مودال ویرایش کالا */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="ویرایش کالا">
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};