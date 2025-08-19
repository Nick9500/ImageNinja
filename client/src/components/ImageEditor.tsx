import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizeControls } from './ResizeControls';
import { CropControls } from './CropControls';
import { DownloadControls } from './DownloadControls';
import { RotateCcw } from 'lucide-react';
import { ImageProcessor, ImageDimensions, CropArea } from '@/lib/imageUtils';

interface ImageEditorProps {
  file: File;
  originalImage: HTMLImageElement;
  onReset: () => void;
}

export function ImageEditor({ file, originalImage, onReset }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processor, setProcessor] = useState<ImageProcessor | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [currentDimensions, setCurrentDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [cropMode, setCropMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current && originalImage) {
      const imageProcessor = new ImageProcessor(canvasRef.current);
      // Set the original image directly in the processor
      imageProcessor.originalImage = originalImage;
      imageProcessor.drawImage(originalImage);
      setProcessor(imageProcessor);
      
      const dims = { width: originalImage.width, height: originalImage.height };
      setOriginalDimensions(dims);
      setCurrentDimensions(dims);
      setCropArea({ x: 0, y: 0, width: Math.min(200, dims.width), height: Math.min(150, dims.height) });
    }
  }, [originalImage]);

  const handleResize = useCallback((dimensions: ImageDimensions) => {
    console.log('ImageEditor handleResize called with:', dimensions);
    if (processor) {
      console.log('Processor exists, calling resize');
      processor.resize(dimensions.width, dimensions.height);
      setCurrentDimensions(dimensions);
      // Adjust crop area to stay within new bounds
      setCropArea(prev => ({
        ...prev,
        x: Math.min(prev.x, dimensions.width - prev.width),
        y: Math.min(prev.y, dimensions.height - prev.height),
        width: Math.min(prev.width, dimensions.width),
        height: Math.min(prev.height, dimensions.height)
      }));
    } else {
      console.log('No processor available');
    }
  }, [processor]);

  const handleCrop = useCallback(() => {
    if (processor) {
      processor.crop(cropArea);
      setCurrentDimensions({ width: cropArea.width, height: cropArea.height });
      setCropArea({ x: 0, y: 0, width: cropArea.width, height: cropArea.height });
      setCropMode(false);
    }
  }, [processor, cropArea]);

  const handleReset = useCallback(() => {
    if (processor) {
      processor.reset();
      const dims = { width: originalImage.width, height: originalImage.height };
      setCurrentDimensions(dims);
      setCropArea({ x: 0, y: 0, width: Math.min(200, dims.width), height: Math.min(150, dims.height) });
      setCropMode(false);
    }
  }, [processor, originalImage]);

  const handleDownload = useCallback((filename: string, quality: number) => {
    if (processor) {
      processor.downloadImage(filename, quality);
    }
  }, [processor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  }, [cropMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !cropMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    const cropX = Math.min(x, dragStart.x);
    const cropY = Math.min(y, dragStart.y);
    
    setCropArea({ 
      x: cropX, 
      y: cropY, 
      width: Math.min(width, currentDimensions.width - cropX),
      height: Math.min(height, currentDimensions.height - cropY)
    });
  }, [isDragging, cropMode, dragStart, currentDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-8" data-testid="image-editor">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Image Editor</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-reset"
              >
                <RotateCcw className="mr-2" size={16} />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted rounded-lg p-4 min-h-[400px] flex items-center justify-center canvas-container">
              <canvas
                ref={canvasRef}
                className="border border-border rounded shadow-lg"
                style={{ 
                  cursor: cropMode ? 'crosshair' : 'default',
                  maxWidth: '100%',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                data-testid="canvas-main"
              />
              
              {cropMode && cropArea.width > 0 && cropArea.height > 0 && (
                <div
                  className="crop-overlay"
                  style={{
                    left: cropArea.x + 16,
                    top: cropArea.y + 16,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                  data-testid="crop-overlay"
                >
                  <div className="crop-handle nw" />
                  <div className="crop-handle ne" />
                  <div className="crop-handle sw" />
                  <div className="crop-handle se" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="text-original-dimensions">
                Original: {originalDimensions.width}×{originalDimensions.height}px
              </span>
              <span data-testid="text-current-dimensions">
                Current: {currentDimensions.width}×{currentDimensions.height}px
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ResizeControls
          originalDimensions={originalDimensions}
          currentDimensions={currentDimensions}
          onResize={handleResize}
        />
        
        <CropControls
          cropArea={cropArea}
          canvasSize={currentDimensions}
          cropMode={cropMode}
          onCropAreaChange={setCropArea}
          onCropModeToggle={() => setCropMode(!cropMode)}
          onApplyCrop={handleCrop}
        />
        
        <DownloadControls
          onDownload={handleDownload}
          onNewUpload={onReset}
        />
      </div>
    </div>
  );
}
