"use client";

import React, { useState, useRef } from "react";
import { Upload, FileImage, Download, RefreshCw, AlertCircle, FileCheck2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SmartDocStudio() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [optimizedUrl, setOptimizedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityUsed, setQualityUsed] = useState<number>(1);
  const [error, setError] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or JPEG).");
      return;
    }
    setError("");
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    
    const origUrl = URL.createObjectURL(selectedFile);
    setOriginalUrl(origUrl);
    
    compressImage(origUrl, selectedFile.name);
  };

  const compressImage = (url: string, fileName: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.src = url;
    
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const targetW = 200;
        const targetH = 230;
        canvas.width = targetW;
        canvas.height = targetH;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Failed to initialize canvas context.");
          setIsProcessing(false);
          return;
        }

        // Center cover crop calculations
        const sourceW = img.width;
        const sourceH = img.height;
        const targetRatio = targetW / targetH;
        const sourceRatio = sourceW / sourceH;
        
        let sx = 0, sy = 0, sWidth = sourceW, sHeight = sourceH;
        
        if (sourceRatio > targetRatio) {
          sWidth = sourceH * targetRatio;
          sx = (sourceW - sWidth) / 2;
        } else {
          sHeight = sourceW / targetRatio;
          sy = (sourceH - sHeight) / 2;
        }

        // Fill background white in case of transparent png
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetW, targetH);
        
        // Draw cropped and scaled image
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
        
        // Quality optimization loop to stay strictly under 50KB
        let quality = 0.90;
        let blob: Blob | null = null;
        
        const getCanvasBlob = (q: number): Promise<Blob> => {
          return new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", q);
          });
        };

        blob = await getCanvasBlob(quality);
        
        // Loop quality scale down if file is > 50KB (51200 bytes)
        while (blob.size > 50 * 1024 && quality > 0.1) {
          quality -= 0.05;
          blob = await getCanvasBlob(quality);
        }

        setOptimizedSize(blob.size);
        setQualityUsed(Math.round(quality * 100));
        
        if (optimizedUrl) {
          URL.revokeObjectURL(optimizedUrl);
        }
        
        const optimizedObjectUrl = URL.createObjectURL(blob);
        setOptimizedUrl(optimizedObjectUrl);
        setIsProcessing(false);
      } catch (err) {
        console.error("Compression error:", err);
        setError("Error compressing document. Please try again.");
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setError("Failed to load image file.");
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!optimizedUrl || !file) return;
    
    const link = document.createElement("a");
    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    link.href = optimizedUrl;
    link.setAttribute("download", `${originalNameWithoutExt}-optimized-200x230.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setFile(null);
    setOriginalSize(0);
    setOptimizedSize(0);
    setError("");
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (optimizedUrl) URL.revokeObjectURL(optimizedUrl);
    setOriginalUrl("");
    setOptimizedUrl("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-xs">
          SmartDoc Studio
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Passport Photo Compressor</h1>
        <p className="text-slate-500 text-sm max-w-xl">
          Resize and compress your passport photo to exactly <span className="font-semibold text-slate-800">200x230px</span> and <span className="font-semibold text-slate-800">under 50KB</span> locally. No server uploads, total privacy, ₹0 cost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Column (Col-Span-2 if no file, otherwise Col-Span-1) */}
        <div className={file ? "md:col-span-1 space-y-4" : "md:col-span-3"}>
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-md font-bold text-slate-850">Upload Document</CardTitle>
              <CardDescription className="text-xs">Drag and drop or browse local image files.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors min-h-[220px] ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept="image/*"
                />
                
                <Upload className="h-10 w-10 text-slate-400 mb-3" />
                <span className="text-sm font-semibold text-slate-700">
                  {file ? "Replace File" : "Choose Image"}
                </span>
                <span className="text-slate-400 text-xs mt-1">
                  Supports PNG, JPG, JPEG
                </span>
              </form>

              {error && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison and Download Column */}
        {file && (
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b border-slate-150 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-md font-bold text-slate-850">Optimization Results</CardTitle>
                    <CardDescription className="text-xs">Direct side-by-side comparison</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* Before */}
                  <div className="flex flex-col items-center space-y-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before</span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center w-[160px] h-[184px]">
                      {originalUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={originalUrl}
                          alt="Original document preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-semibold">
                      {formatSize(originalSize)}
                    </Badge>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="hidden sm:flex flex-col items-center">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
                      {isProcessing ? "Optimizing..." : `${Math.round((1 - optimizedSize / originalSize) * 100)}% Saved`}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="h-0.5 w-8 bg-slate-250"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="flex flex-col items-center space-y-2.5">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                      After <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[9px] px-1 py-0 h-4">200x230</Badge>
                    </span>
                    <div className="border-2 border-blue-100 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center w-[200px] h-[230px] shadow-sm">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                          Processing Canvas...
                        </div>
                      ) : optimizedUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={optimizedUrl}
                          alt="Optimized passport preview"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-semibold flex items-center gap-1 text-xs">
                        <FileCheck2 className="h-3 w-3" /> {formatSize(optimizedSize)}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-medium">
                        JPEG Q: {qualityUsed}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 border-t border-slate-150 bg-slate-50/50 flex justify-end">
                <Button
                  onClick={handleDownload}
                  disabled={isProcessing || !optimizedUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 cursor-pointer shadow"
                  style={{ minHeight: "48px" }}
                >
                  <Download className="h-5 w-5" /> Download Optimized Photo
                </Button>
              </CardFooter>
            </Card>

            <div className="flex gap-2 p-3 bg-blue-50/40 text-blue-800 text-xs rounded-xl border border-blue-100/50">
              <FileImage className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Passport Photo Criteria Met:</strong> The crop algorithm automatically centers your photo, resizes it to exactly 200 width and 230 height, and restricts the exported size to stay under the 50KB portal limit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
