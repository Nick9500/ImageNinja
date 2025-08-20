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
  const [dragMode, setDragMode] = useState<'create' | 'move' | 'resize'>('create');
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);

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
    if (processor) {
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

  const handleCropHandleMouseDown = useCallback((e: React.MouseEvent, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('resize');
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCropOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragMode('move');
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ 
        x: e.clientX - (cropArea.x + 16), // Account for container padding
        y: e.clientY - (cropArea.y + 16)
      });
    }
  }, [cropArea]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!cropMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragMode('create');
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  }, [cropMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !cropMode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    if (dragMode === 'create') {
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
    } else if (dragMode === 'move') {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, currentDimensions.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, currentDimensions.height - cropArea.height));
      
      setCropArea(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (dragMode === 'resize' && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCropArea(prev => {
        let newCrop = { ...prev };
        
        switch (resizeHandle) {
          case 'nw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(10, prev.width - deltaX);
            newCrop.height = Math.max(10, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(10, prev.width + deltaX);
            newCrop.height = Math.max(10, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(10, prev.width - deltaX);
            newCrop.height = Math.max(10, prev.height + deltaY);
            break;
          case 'se':
            newCrop.width = Math.max(10, prev.width + deltaX);
            newCrop.height = Math.max(10, prev.height + deltaY);
            break;
        }
        
        // Ensure crop stays within canvas bounds
        newCrop.width = Math.min(newCrop.width, currentDimensions.width - newCrop.x);
        newCrop.height = Math.min(newCrop.height, currentDimensions.height - newCrop.y);
        
        return newCrop;
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, cropMode, dragMode, dragStart, currentDimensions, cropArea, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode('create');
    setResizeHandle(null);
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
            <div className="relative bg-muted rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-auto flex items-center justify-center canvas-container">
              <canvas
                ref={canvasRef}
                className="border border-border rounded shadow-lg"
                style={{ 
                  cursor: cropMode ? 'crosshair' : 'default',
                  maxWidth: '100%',
                  height: 'auto'
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
                  onMouseDown={handleCropOverlayMouseDown}
                  data-testid="crop-overlay"
                >
                  <div 
                    className="crop-handle nw" 
                    onMouseDown={(e) => handleCropHandleMouseDown(e, 'nw')}
                  />
                  <div 
                    className="crop-handle ne" 
                    onMouseDown={(e) => handleCropHandleMouseDown(e, 'ne')}
                  />
                  <div 
                    className="crop-handle sw" 
                    onMouseDown={(e) => handleCropHandleMouseDown(e, 'sw')}
                  />
                  <div 
                    className="crop-handle se" 
                    onMouseDown={(e) => handleCropHandleMouseDown(e, 'se')}
                  />
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
