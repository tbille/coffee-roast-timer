import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { toast } from "sonner";
import { MAX_PHOTO_SIZE_MB } from '@/types/cupping.types';

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
      <Label>Photo of the roasted beans</Label>

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
            className="absolute top-2 right-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            onClick={handleRemovePhoto}
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
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
            border-2 border-dashed rounded-lg p-6 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-muted' : 'border-input hover:bg-muted/50'}
          `}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload a photo of the roasted beans"
        >
          <Camera className="h-8 w-8 mx-auto mb-3 text-muted-foreground" strokeWidth={1.75} aria-hidden />
          <p className="text-sm text-foreground mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Any image, up to {MAX_PHOTO_SIZE_MB} MB
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
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
            <span className="text-sm text-muted-foreground">Uploading…</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
    </div>
  );
}
