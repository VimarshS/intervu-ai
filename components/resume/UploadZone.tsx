"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onAnalysisComplete: (analysis: ResumeAnalysis) => void;
  onPaymentRequired?: () => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export interface ResumeAnalysis {
  id: string;
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  gap_analysis: string;
  predicted_questions: string[];
  created_at: string;
  file_url: string;
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    // PDF.js v5 uses a different worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
   const pdf = await pdfjsLib.getDocument({
  data: arrayBuffer,
  useWorkerFetch: false,
  useSystemFonts: true,
}).promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ("str" in item) return item.str;
          return "";
        })
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF extraction error:", err);
    throw new Error(
      `PDF extraction failed: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
}

export function UploadZone({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
}: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setSelectedFile(file);
  }, []);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setExtractionProgress(10);

    try {
      // Step 1 — Extract text from PDF in browser
      toast.info("Extracting text from PDF...");
      setExtractionProgress(30);

      const extractedText = await extractTextFromPDF(selectedFile);

      if (!extractedText || extractedText.length < 50) {
        toast.error(
          "Could not extract text from this PDF. Try a text-based PDF."
        );
        setIsAnalyzing(false);
        setExtractionProgress(0);
        return;
      }

      setExtractionProgress(60);
      toast.info("Analyzing with AI...");

      // Step 2 — Send to API route
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("extracted_text", extractedText);

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.status === 402) {
  onPaymentRequired?.();
  return;
}

if (!response.ok) {
  toast.error(result.message ?? "Analysis failed. Please try again.");
  return;
}
      setExtractionProgress(100);
      toast.success("Resume analyzed successfully!");
      onAnalysisComplete(result.analysis);
      setSelectedFile(null);
      setExtractionProgress(0);
    } catch (err) {
  console.error("Upload error:", err);
  toast.error(err instanceof Error ? err.message : "Something went wrong.");
}finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          selectedFile ? "cursor-default" : "cursor-pointer"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB · PDF
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop your resume here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF only · Maximum 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar during analysis */}
      {isAnalyzing && (
        <div className="space-y-2">
          <Progress value={extractionProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {extractionProgress < 50
              ? "Extracting text from PDF..."
              : "Analyzing with AI..."}
          </p>
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !isAnalyzing && (
        <Button
          className="w-full"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <FileText className="mr-2 h-4 w-4" />
          Analyze Resume
        </Button>
      )}

      {isAnalyzing && (
        <Button className="w-full" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </Button>
      )}
    </div>
  );
}