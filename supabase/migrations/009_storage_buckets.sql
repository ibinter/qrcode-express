-- Bucket pour les images uploadées (photos de profil, couverture, logos QR)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-images',
  'qr-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Bucket pour les PDFs générés
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-pdfs',
  'qr-pdfs',
  true,
  10485760, -- 10 MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Politique RLS : lecture publique sur qr-images
CREATE POLICY "Public read qr-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-images');

-- Politique RLS : upload uniquement par utilisateur authentifié dans son dossier
CREATE POLICY "Auth upload qr-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'qr-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique RLS : suppression par le propriétaire uniquement
CREATE POLICY "Owner delete qr-images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'qr-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique RLS : lecture publique sur qr-pdfs
CREATE POLICY "Public read qr-pdfs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-pdfs');

-- Politique RLS : upload PDFs par utilisateur authentifié
CREATE POLICY "Auth upload qr-pdfs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'qr-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
