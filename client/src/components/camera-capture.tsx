import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
}

export function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG, PNG, GIF, or PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      onImageCapture(file);
    }
  }, [onImageCapture, toast]);

  const handleCameraCapture = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Camera Preview Area */}
      <div className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
        
        {/* Scan Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-48 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-white text-sm font-medium text-center px-4">
            Position receipt within frame
          </span>
        </div>
        
        {/* Camera Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full h-16 w-16 p-0"
            onClick={handleCameraCapture}
            disabled={isCapturing}
            data-testid="button-camera-capture"
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Upload Options */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Or Upload File</h2>
          
          <Button
            variant="outline"
            className="w-full h-24 border-2 border-dashed hover:border-primary hover:bg-primary/5"
            onClick={handleUploadClick}
            data-testid="button-file-upload"
          >
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Tap to select image or PDF</p>
            </div>
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Supports JPG, PNG, GIF, PDF up to 10MB
          </p>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-accent/20 border-accent/30">
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center mb-2">
            <FileText className="h-4 w-4 text-accent-foreground mr-2" />
            Scanning Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Keep receipt flat and straight</li>
            <li>• Include all edges in frame</li>
          </ul>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-hidden"
      />
    </div>
  );
}
