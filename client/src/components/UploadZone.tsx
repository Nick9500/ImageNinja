import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CloudUpload, FolderOpen, AlertTriangle } from 'lucide-react';
import { ImageProcessor } from '@/lib/imageUtils';

interface UploadZoneProps {
  onImageLoaded: (file: File, image: HTMLImageElement) => void;
}

export function UploadZone({ onImageLoaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setIsLoading(true);

    // Validate file
    const validation = ImageProcessor.validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      setIsLoading(false);
      return;
    }

    try {
      // Create a temporary canvas for loading
      const tempCanvas = document.createElement('canvas');
      const processor = new ImageProcessor(tempCanvas);
      const image = await processor.loadImage(file);
      onImageLoaded(file, image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load image. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onImageLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleBrowseClick = useCallback(() => {
    document.getElementById('file-input')?.click();
  }, []);

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Resize & Crop Your Images</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload a JPEG image, resize it with precise controls, crop it to perfection, and download instantly.
        </p>
      </div>

      <div
        className={`relative bg-card border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary hover:bg-card/80'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={0}
        aria-label="Upload image file by dropping or clicking to browse"
        aria-describedby="upload-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
        data-testid="upload-zone"
      >
        <div className="space-y-6">
          <div className={`mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center transition-transform ${
            isDragging ? 'scale-110' : 'group-hover:scale-110'
          }`}>
            {isLoading ? (
              <div className="loading-spinner w-6 h-6" />
            ) : (
              <CloudUpload className="text-2xl text-white" size={24} />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {isLoading ? 'Processing...' : 'Drop your JPEG here'}
            </h3>
            <p id="upload-instructions" className="text-muted-foreground mb-4">
              {isLoading ? 'Please wait while we load your image' : 'or click to browse files'}
            </p>
            
            {!isLoading && (
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
                data-testid="button-browse-files"
              >
                <FolderOpen className="mr-2" size={16} />
                Browse Files
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Supported format: JPEG</p>
            <p>Maximum size: 30MB</p>
          </div>
        </div>
        
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileSelect}
          aria-label="Select image file"
          data-testid="input-file"
        />
      </div>

      {error && (
        <Alert className="mt-4 border-destructive bg-destructive/10" data-testid="alert-error">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
