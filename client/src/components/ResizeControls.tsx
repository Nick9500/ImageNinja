import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Maximize2 } from 'lucide-react';
import { ImageDimensions, ImageProcessor } from '@/lib/imageUtils';

interface ResizeControlsProps {
  originalDimensions: ImageDimensions;
  currentDimensions: ImageDimensions;
  onResize: (dimensions: ImageDimensions) => void;
}

export function ResizeControls({ 
  originalDimensions, 
  currentDimensions, 
  onResize 
}: ResizeControlsProps) {
  const [width, setWidth] = useState(currentDimensions.width);
  const [height, setHeight] = useState(currentDimensions.height);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [scale, setScale] = useState([1]);

  useEffect(() => {
    setWidth(currentDimensions.width);
    setHeight(currentDimensions.height);
    
    // Update scale based on current dimensions relative to original
    if (originalDimensions.width > 0) {
      const currentScale = currentDimensions.width / originalDimensions.width;
      setScale([currentScale]);
    }
  }, [currentDimensions, originalDimensions]);

  const aspectRatio = originalDimensions.width / originalDimensions.height;

  const handleWidthChange = useCallback((value: string) => {
    const newWidth = parseInt(value) || 0;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth > 0) {
      const newHeight = Math.round(newWidth / aspectRatio);
      setHeight(newHeight);
      // Update scale slider
      if (originalDimensions.width > 0) {
        setScale([newWidth / originalDimensions.width]);
      }
      // Remove immediate resize
    } else if (newWidth > 0) {
      // Update scale slider
      if (originalDimensions.width > 0) {
        setScale([newWidth / originalDimensions.width]);
      }
      // Remove immediate resize
    }
  }, [maintainAspectRatio, aspectRatio, onResize, height, originalDimensions]);

  const handleHeightChange = useCallback((value: string) => {
    const newHeight = parseInt(value) || 0;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight > 0) {
      const newWidth = Math.round(newHeight * aspectRatio);
      setWidth(newWidth);
      // Update scale slider
      if (originalDimensions.width > 0) {
        setScale([newWidth / originalDimensions.width]);
      }
      // Remove immediate resize
    } else if (newHeight > 0) {
      // For height changes without aspect ratio, update scale based on width
      if (originalDimensions.width > 0) {
        setScale([width / originalDimensions.width]);
      }
      // Remove immediate resize
    }
  }, [maintainAspectRatio, aspectRatio, onResize, width, originalDimensions]);

  const handleScaleChange = useCallback((value: number[]) => {
    const scaleValue = value[0];
    setScale(value);
    
    const newWidth = Math.round(originalDimensions.width * scaleValue);
    const newHeight = Math.round(originalDimensions.height * scaleValue);
    
    setWidth(newWidth);
    setHeight(newHeight);
    
    // Remove immediate resize - only update on button click or input change
  }, [originalDimensions]);



  const handleAspectRatioChange = useCallback((checked: boolean) => {
    setMaintainAspectRatio(checked);
    if (checked && width > 0) {
      const newHeight = Math.round(width / aspectRatio);
      setHeight(newHeight);
      // Remove immediate resize
    }
  }, [width, aspectRatio, onResize]);

  return (
    <Card data-testid="resize-controls">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Maximize2 className="text-primary mr-2" size={20} />
          Resize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="width-input" className="text-sm text-muted-foreground">
              Width (px)
            </Label>
            <Input
              id="width-input"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="800"
              data-testid="input-width"
            />
          </div>
          <div>
            <Label htmlFor="height-input" className="text-sm text-muted-foreground">
              Height (px)
            </Label>
            <Input
              id="height-input"
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="600"
              data-testid="input-height"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="aspect-ratio"
            checked={maintainAspectRatio}
            onCheckedChange={handleAspectRatioChange}
            className="border-border data-[state=checked]:bg-primary"
            data-testid="checkbox-aspect-ratio"
          />
          <Label htmlFor="aspect-ratio" className="text-sm text-muted-foreground">
            Maintain aspect ratio
          </Label>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-muted-foreground">Scale</Label>
            <span className="text-sm text-primary font-medium" data-testid="text-scale-value">
              {Math.round(scale[0] * 100)}%
            </span>
          </div>
          <Slider
            value={scale}
            onValueChange={handleScaleChange}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
            data-testid="slider-scale"
          />
          <div className="relative mt-2 h-4">
            <span className="absolute text-xs text-muted-foreground" style={{ left: '0%' }}>10%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ left: '13.8%' }}>50%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ left: '31%' }}>100%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ left: '48.3%' }}>150%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ left: '65.5%' }}>200%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ left: '82.8%' }}>250%</span>
            <span className="absolute text-xs text-muted-foreground" style={{ right: '0%' }}>300%</span>
          </div>
        </div>
        
        <Button 
          onClick={() => onResize({ width, height })}
          className="w-full"
          data-testid="button-apply-resize"
        >
          Apply Resize
        </Button>
      </CardContent>
    </Card>
  );
}
