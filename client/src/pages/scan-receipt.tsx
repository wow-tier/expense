import { useState } from "react";
import { CameraCapture } from "@/components/camera-capture";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { extractTextFromImage, parseReceiptText } from "@/lib/ocr";
import { useToast } from "@/hooks/use-toast";

export default function ScanReceipt() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageCapture = async (file: File) => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processing receipt",
        description: "Extracting text from your receipt...",
      });

      // Extract text using OCR
      const extractedText = await extractTextFromImage(file);
      
      // Parse the extracted text
      const parsedData = parseReceiptText(extractedText);
      
      toast({
        title: "Receipt processed successfully",
        description: "Review the extracted information and save your expense.",
      });

      // Navigate to review page with extracted data
      setLocation("/review", {
        state: {
          extractedData: parsedData,
          originalFile: file,
        }
      });
    } catch (error) {
      console.error("OCR processing error:", error);
      toast({
        title: "Processing failed",
        description: "Failed to extract text from receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Processing Receipt</h2>
            <p className="text-muted-foreground">
              Extracting text and parsing receipt data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3" data-testid="button-back-to-dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Scan Receipt</h1>
        </div>
      </header>

      <div className="p-4">
        <CameraCapture onImageCapture={handleImageCapture} />
      </div>
    </div>
  );
}
