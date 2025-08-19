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
  }, [currentDimensions]);

  const aspectRatio = originalDimensions.width / originalDimensions.height;

  const handleWidthChange = useCallback((value: string) => {
    const newWidth = parseInt(value) || 0;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth > 0) {
      const newHeight = Math.round(newWidth / aspectRatio);
      setHeight(newHeight);
    }
  }, [maintainAspectRatio, aspectRatio]);

  const handleHeightChange = useCallback((value: string) => {
    const newHeight = parseInt(value) || 0;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight > 0) {
      const newWidth = Math.round(newHeight * aspectRatio);
      setWidth(newWidth);
    }
  }, [maintainAspectRatio, aspectRatio]);

  const handleScaleChange = useCallback((value: number[]) => {
    const scaleValue = value[0];
    setScale(value);
    
    const newWidth = Math.round(originalDimensions.width * scaleValue);
    const newHeight = Math.round(originalDimensions.height * scaleValue);
    
    setWidth(newWidth);
    setHeight(newHeight);
  }, [originalDimensions]);

  const handleApplyResize = useCallback(() => {
    if (width > 0 && height > 0) {
      onResize({ width, height });
    }
  }, [width, height, onResize]);

  const handleAspectRatioChange = useCallback((checked: boolean) => {
    setMaintainAspectRatio(checked);
    if (checked && width > 0) {
      const newHeight = Math.round(width / aspectRatio);
      setHeight(newHeight);
    }
  }, [width, aspectRatio]);

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
          <Label className="text-sm text-muted-foreground mb-2 block">
            Scale
          </Label>
          <Slider
            value={scale}
            onValueChange={handleScaleChange}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
            data-testid="slider-scale"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>10%</span>
            <span>300%</span>
          </div>
        </div>
        
        <Button 
          onClick={handleApplyResize}
          className="w-full bg-primary hover:bg-primary/90"
          data-testid="button-apply-resize"
        >
          Apply Resize
        </Button>
      </CardContent>
    </Card>
  );
}
