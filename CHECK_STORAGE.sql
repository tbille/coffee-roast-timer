-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'roast-photos';

-- Check storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Check if any files exist in the bucket
SELECT * FROM storage.objects 
WHERE bucket_id = 'roast-photos' 
LIMIT 5;
