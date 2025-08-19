import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download } from 'lucide-react';

interface DownloadControlsProps {
  onDownload: (filename: string, quality: number) => void;
  onNewUpload: () => void;
}

export function DownloadControls({ onDownload, onNewUpload }: DownloadControlsProps) {
  const [filename, setFilename] = useState('resized-image');
  const [quality, setQuality] = useState([0.9]);

  const handleDownload = () => {
    onDownload(filename || 'resized-image', quality[0]);
  };

  return (
    <div className="space-y-6">
      <Card data-testid="download-controls">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="text-primary mr-2" size={20} />
            Download
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Quality
            </Label>
            <Slider
              value={quality}
              onValueChange={setQuality}
              min={0.5}
              max={1}
              step={0.05}
              className="w-full"
              data-testid="slider-quality"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div>
            <Label htmlFor="filename" className="text-sm text-muted-foreground">
              Filename
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="bg-muted border-border focus:border-primary"
              placeholder="resized-image"
              data-testid="input-filename"
            />
          </div>
          
          <Button 
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            data-testid="button-download"
          >
            <Download className="mr-2" size={16} />
            Download Image
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="secondary"
        className="w-full"
        onClick={onNewUpload}
        data-testid="button-new-upload"
      >
        <span className="mr-2">+</span>
        Upload New Image
      </Button>
    </div>
  );
}
