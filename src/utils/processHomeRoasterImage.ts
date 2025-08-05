import { removeBackground, loadImage } from './backgroundRemoval';
import homeRoasterImage from '@/assets/home-coffee-roaster.jpg';

export const processHomeRoasterImage = async (): Promise<string> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(homeRoasterImage);
    const blob = await response.blob();
    
    // Load as HTMLImageElement
    const imageElement = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(imageElement);
    
    // Convert to object URL for display
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing home roaster image:', error);
    // Fallback to original image
    return homeRoasterImage;
  }
};