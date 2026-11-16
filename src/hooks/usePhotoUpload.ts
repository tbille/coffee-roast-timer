import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { IMAGE_COMPRESSION_OPTIONS } from '@/types/cupping.types';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadPhoto = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    setUploading(true);
    setProgress(0);

    try {
      // Compress image before upload
      const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
      setProgress(50);

      // Generate unique filename
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('roast-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Provide more helpful error messages
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Photo storage is not available right now.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('roast-photos')
        .getPublicUrl(fileName);

      setProgress(100);
      return publicUrl;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deletePhoto = async (url: string) => {
    if (!user) throw new Error('User not authenticated');

    // Extract path from URL
    const path = url.split('/roast-photos/')[1];
    
    if (!path) {
      throw new Error('Invalid photo URL');
    }

    const { error } = await supabase.storage
      .from('roast-photos')
      .remove([path]);

    if (error) throw error;
  };

  return { uploadPhoto, deletePhoto, uploading, progress };
}
