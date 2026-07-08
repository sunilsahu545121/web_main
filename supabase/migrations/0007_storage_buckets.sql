-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('banners', 'banners', true),
('avatars', 'avatars', true),
('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'products' (Public Read, Authenticated Upload/Update/Delete)
CREATE POLICY "Public Access for products" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload products" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON storage.objects
FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON storage.objects
FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- 2. Policies for 'banners' (Public Read, Super Admin Only for writes - simplified to authenticated for now)
CREATE POLICY "Public Access for banners" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can manage banners" ON storage.objects
FOR ALL USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- 3. Policies for 'avatars' (Public Read, Authenticated manage own)
CREATE POLICY "Public Access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can manage avatars" ON storage.objects
FOR ALL USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Policies for 'kyc-documents' (Private Read/Write for authenticated users only)
CREATE POLICY "Authenticated users can view own kyc docs" ON storage.objects
FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload kyc docs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage own kyc docs" ON storage.objects
FOR UPDATE USING (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete own kyc docs" ON storage.objects
FOR DELETE USING (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');
