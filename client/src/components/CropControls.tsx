import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crop, MousePointer } from 'lucide-react';
import { CropArea } from '@/lib/imageUtils';

interface CropControlsProps {
  cropArea: CropArea;
  canvasSize: { width: number; height: number };
  cropMode: boolean;
  onCropAreaChange: (cropArea: CropArea) => void;
  onCropModeToggle: () => void;
  onApplyCrop: () => void;
}

export function CropControls({
  cropArea,
  canvasSize,
  cropMode,
  onCropAreaChange,
  onCropModeToggle,
  onApplyCrop
}: CropControlsProps) {
  const handleInputChange = useCallback((field: keyof CropArea, value: string) => {
    const numValue = parseInt(value) || 0;
    const newCropArea = { ...cropArea, [field]: numValue };
    
    // Ensure crop area stays within canvas bounds
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, canvasSize.width - newCropArea.width));
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, canvasSize.height - newCropArea.height));
    newCropArea.width = Math.max(1, Math.min(newCropArea.width, canvasSize.width - newCropArea.x));
    newCropArea.height = Math.max(1, Math.min(newCropArea.height, canvasSize.height - newCropArea.y));
    
    onCropAreaChange(newCropArea);
  }, [cropArea, canvasSize, onCropAreaChange]);

  return (
    <Card data-testid="crop-controls">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crop className="text-primary mr-2" size={20} />
          Crop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="crop-x" className="text-sm text-muted-foreground">
              X Position
            </Label>
            <Input
              id="crop-x"
              type="number"
              value={cropArea.x}
              onChange={(e) => handleInputChange('x', e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="0"
              data-testid="input-crop-x"
            />
          </div>
          <div>
            <Label htmlFor="crop-y" className="text-sm text-muted-foreground">
              Y Position
            </Label>
            <Input
              id="crop-y"
              type="number"
              value={cropArea.y}
              onChange={(e) => handleInputChange('y', e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="0"
              data-testid="input-crop-y"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="crop-width" className="text-sm text-muted-foreground">
              Crop Width
            </Label>
            <Input
              id="crop-width"
              type="number"
              value={cropArea.width}
              onChange={(e) => handleInputChange('width', e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="400"
              data-testid="input-crop-width"
            />
          </div>
          <div>
            <Label htmlFor="crop-height" className="text-sm text-muted-foreground">
              Crop Height
            </Label>
            <Input
              id="crop-height"
              type="number"
              value={cropArea.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="300"
              data-testid="input-crop-height"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            className="flex-1 text-sm"
            onClick={onCropModeToggle}
            data-testid="button-toggle-crop-mode"
          >
            <MousePointer className="mr-2" size={14} />
            {cropMode ? 'Exit Crop' : 'Select Area'}
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-sm"
            onClick={onApplyCrop}
            data-testid="button-apply-crop"
          >
            Apply Crop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
