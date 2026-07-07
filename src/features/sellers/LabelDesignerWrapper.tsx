import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { LabelDesigner } from '@/components/barcode/LabelDesigner';
import { generateEAN13 } from '@/lib/barcode/encoder';
import { LabelData } from '@/lib/barcode/label';

export function LabelDesignerWrapper() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product } = useQuery<any>({
    queryKey: ['product', productId],
    enabled: !!productId,
    queryFn: async (): Promise<any> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!product) return <div>Loading…</div>;
  const initialData: LabelData = {
    productName: product.name,
    sku: product.sku,
    barcode: product.barcode_value ?? generateEAN13(product.id),
    price: product.price,
    mrp: product.mrp,
    weight: product.weight,
    batchNumber: product.batch_number,
    expiryDate: product.expiry_date,
    brand: product.brand,
    hsnCode: product.hsn_code,
    countryOfOrigin: product.country_of_origin ?? 'India',
  };
  return <LabelDesigner initialData={initialData} />;
}
