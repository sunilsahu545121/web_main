// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

export function ProductCatalog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (payload: any) => {
      const sku = `KRX-${Date.now().toString(36).toUpperCase()}`;
      const barcode = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const { error } = await supabase.from('products').insert({ ...payload, seller_id: user!.id, sku, barcode });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setCreateOpen(false); toast.success('Product created'); },
  });

  const bulkUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data.map((r: any) => ({
          seller_id: user!.id,
          name: r.name,
          price: Number(r.price),
          stock_quantity: Number(r.stock),
          sku: `KRX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`,
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        }));
        const { error } = await supabase.from('products').insert(rows);
        if (error) return toast.error(error.message);
        toast.success(`Imported ${rows.length} products`);
        qc.invalidateQueries({ queryKey: ['products'] });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <div className="flex gap-2">
          <label>
            <Button variant="outline" asChild={false}><Upload className="h-4 w-4" /> Bulk CSV</Button>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && bulkUpload(e.target.files[0])} />
          </label>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-6 text-center">Loading…</td></tr>}
              {products?.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-3">₹{p.price}</td>
                  <td className="px-4 py-3">{p.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New Product">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createProduct.mutate({
              name: fd.get('name'),
              price: Number(fd.get('price')),
              stock_quantity: Number(fd.get('stock')),
              description: fd.get('description'),
              category: fd.get('category'),
            });
          }}
          className="space-y-2"
        >
          <Input name="name" placeholder="Product name" required />
          <Input name="category" placeholder="Category" required />
          <Input name="price" type="number" placeholder="Price (₹)" required />
          <Input name="stock" type="number" placeholder="Stock" required />
          <textarea name="description" placeholder="Description" className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button type="submit" loading={createProduct.isPending} className="w-full">Create</Button>
        </form>
      </Dialog>
    </div>
  );
}
