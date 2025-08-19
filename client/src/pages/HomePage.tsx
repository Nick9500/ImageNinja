import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { ImageEditor } from '@/components/ImageEditor';
import { Crop, Shield } from 'lucide-react';

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState<{ file: File; image: HTMLImageElement } | null>(null);

  const handleImageLoaded = (file: File, image: HTMLImageElement) => {
    setCurrentImage({ file, image });
  };

  const handleReset = () => {
    setCurrentImage(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border py-4" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crop className="text-primary text-2xl" size={32} />
              <h1 className="text-xl font-bold">Image Resizer Pro</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Max file size: 30MB</span>
              <span>•</span>
              <span>JPEG only</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="main-content">
        {!currentImage ? (
          <UploadZone onImageLoaded={handleImageLoaded} />
        ) : (
          <ImageEditor
            file={currentImage.file}
            originalImage={currentImage.image}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 mt-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© 2024 Image Resizer Pro</span>
              <span>•</span>
              <span>Client-side processing</span>
              <span>•</span>
              <span>Your data stays private</span>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="text-green-400" size={16} />
              <span className="text-sm text-muted-foreground">Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
