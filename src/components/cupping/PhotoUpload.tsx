import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from "sonner";
import { ACCEPTED_IMAGE_TYPES, MAX_PHOTO_SIZE_MB } from '@/types/cupping.types';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved: () => void;
}

export function PhotoUpload({ currentPhotoUrl, onPhotoUploaded, onPhotoRemoved }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, deletePhoto, uploading, progress } = usePhotoUpload();

  const handleFileSelect = async (file: File) => {
    // Validate file type - accept all image/* types
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: `Please upload an image file. Received: ${file.type}` });
      return;
    }

    // Validate file size
    const maxSizeBytes = MAX_PHOTO_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('File too large', { description: `Please upload an image smaller than ${MAX_PHOTO_SIZE_MB}MB.` });
      return;
    }

    try {
      // Delete old photo if exists
      if (currentPhotoUrl) {
        await deletePhoto(currentPhotoUrl);
      }

      // Upload new photo
      const url = await uploadPhoto(file);
      onPhotoUploaded(url);
      
      toast.success('Photo uploaded', { description: 'Your roasted bean photo has been uploaded successfully.' });
    } catch (error) {
      console.error('Photo upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo. Please try again.';
      toast.error('Upload failed', { description: errorMessage });
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      await deletePhoto(currentPhotoUrl);
      onPhotoRemoved();
      
      toast.success('Photo removed', { description: 'Your photo has been removed.' });
    } catch (error) {
      console.error('Photo delete error:', error);
      toast.error('Delete failed', { description: 'Failed to remove photo. Please try again.' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Roasted Bean Photo</Label>

      {/* Current photo preview */}
      {currentPhotoUrl && !uploading && (
        <div className="relative group">
          <img
            src={currentPhotoUrl}
            alt="Roasted beans"
            className="w-full max-w-md rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemovePhoto}
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload area */}
      {!currentPhotoUrl && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            Any image format (Max {MAX_PHOTO_SIZE_MB}MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            aria-label="Upload roasted bean photo"
          />
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
    </div>
  );
}
