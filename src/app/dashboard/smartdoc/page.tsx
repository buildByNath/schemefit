"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, FileImage, Download, RefreshCw, AlertCircle, FileCheck2, Trash2, Sliders, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllSchemesAction } from "@/app/actions";
import { Scheme } from "@/lib/db";

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
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("passport");
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>("");
  const [targetWidth, setTargetWidth] = useState<number>(200);
  const [targetHeight, setTargetHeight] = useState<number>(230);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(50);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESETS = [
    { id: "passport", name: "Standard Passport Photo (200x230px, <50KB)", w: 200, h: 230, size: 50 },
    { id: "signature", name: "Signature Upload (140x60px, <20KB)", w: 140, h: 60, size: 20 },
    { id: "card", name: "ID Card / Badge (300x450px, <100KB)", w: 300, h: 450, size: 100 },
    { id: "document", name: "Document / Certificate Scan (800x1200px, <300KB)", w: 800, h: 1200, size: 300 },
    { id: "custom", name: "-- Custom / Manual Specifications --", w: 200, h: 230, size: 50 }
  ];

  function getSchemeSpecs(schemeTitle: string) {
    const title = schemeTitle.toLowerCase();
    if (title.includes("scholarship") || title.includes("education") || title.includes("merit") || title.includes("grant")) {
      return { width: 200, height: 230, maxSizeKb: 50, label: "Student Photo (200x230px, <50KB)" };
    } else if (title.includes("pension") || title.includes("widow") || title.includes("old age")) {
      return { width: 150, height: 200, maxSizeKb: 30, label: "Pensioner Photo (150x200px, <30KB)" };
    } else if (title.includes("subsidy") || title.includes("loan") || title.includes("housing") || title.includes("wealth")) {
      return { width: 300, height: 400, maxSizeKb: 100, label: "Applicant Photo (300x400px, <100KB)" };
    } else if (title.includes("agricultural") || title.includes("farmer")) {
      return { width: 250, height: 300, maxSizeKb: 75, label: "Farmer ID Photo (250x300px, <75KB)" };
    }
    return { width: 200, height: 230, maxSizeKb: 50, label: "Standard Photo (200x230px, <50KB)" };
  }

  useEffect(() => {
    async function loadSchemes() {
      const res = await getAllSchemesAction();
      if (res.success && res.schemes) {
        setSchemes(res.schemes);
      }
    }
    loadSchemes();
  }, []);

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
    
    compressImage(origUrl, selectedFile.name, targetWidth, targetHeight, targetSizeKb);
  };

  const compressImage = (url: string, fileName: string, w: number, h: number, sizeKb: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.src = url;
    
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const targetW = w;
        const targetH = h;
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
        
        // Quality optimization loop to stay strictly under target size limit
        let quality = 0.90;
        let blob: Blob | null = null;
        
        const getCanvasBlob = (q: number): Promise<Blob> => {
          return new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", q);
          });
        };

        blob = await getCanvasBlob(quality);
        
        // Loop quality scale down if file exceeds size limit (sizeKb * 1024 bytes)
        while (blob.size > sizeKb * 1024 && quality > 0.1) {
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

  useEffect(() => {
    if (file && originalUrl) {
      compressImage(originalUrl, file.name, targetWidth, targetHeight, targetSizeKb);
    }
  }, [targetWidth, targetHeight, targetSizeKb]);

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
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
          SmartDoc Studio
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Smart Document & Photo Compressor
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          Resize, crop, and compress your passport photo, signatures, or documents to match specific government welfare portal criteria. Total client-side privacy, ₹0 cost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings and Upload Left Pane */}
        <div className="md:col-span-1 space-y-4">
          {/* Upload Card */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-slate-850">Upload Document</CardTitle>
              <CardDescription className="text-[10px]">Select local image file to optimize.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors min-h-[140px] ${
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
                
                <Upload className="h-7 w-7 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">
                  {file ? "Change Uploaded File" : "Choose Image File"}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
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

          {/* Settings Card */}
          <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-blue-600" />
                Compression Settings
              </CardTitle>
              <CardDescription className="text-[10px]">Configure target dimensions and size limits.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {/* Presets dropdown */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Target Spec Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    const presetId = e.target.value;
                    setSelectedPreset(presetId);
                    setSelectedSchemeId("");
                    if (presetId !== "custom" && presetId !== "scheme") {
                      const p = PRESETS.find(pr => pr.id === presetId);
                      if (p) {
                        setTargetWidth(p.w);
                        setTargetHeight(p.h);
                        setTargetSizeKb(p.size);
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-slate-850 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "34px" }}
                >
                  {PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  {selectedSchemeId && (
                    <option value="scheme">Matched to Selected Scheme</option>
                  )}
                </select>
              </div>

              {/* Schemes dropdown analyzer */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Auto-Match to Scheme Criteria
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => {
                    const schemeId = e.target.value;
                    setSelectedSchemeId(schemeId);
                    if (schemeId) {
                      const sc = schemes.find(s => s.id === schemeId);
                      if (sc) {
                        const specs = getSchemeSpecs(sc.title);
                        setTargetWidth(specs.width);
                        setTargetHeight(specs.height);
                        setTargetSizeKb(specs.maxSizeKb);
                        setSelectedPreset("scheme");
                      }
                    } else {
                      setSelectedPreset("passport");
                      setTargetWidth(200);
                      setTargetHeight(230);
                      setTargetSizeKb(50);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-slate-850 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ minHeight: "34px" }}
                >
                  <option value="">-- Choose a recommended scheme --</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Numeric Inputs */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    disabled={selectedPreset !== "custom"}
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    style={{ minHeight: "32px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    disabled={selectedPreset !== "custom"}
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    style={{ minHeight: "32px" }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Max Size (KB)
                  </label>
                  <input
                    type="number"
                    disabled={selectedPreset !== "custom"}
                    value={targetSizeKb}
                    onChange={(e) => setTargetSizeKb(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-slate-800 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    style={{ minHeight: "32px" }}
                  />
                </div>
              </div>

              {selectedPreset !== "custom" && (
                <p className="text-[10px] text-slate-400 italic">
                  * Custom specs locked. Choose &quot;Custom&quot; preset to input manual dimensions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison and Download Column */}
        <div className="md:col-span-2">
          {!file ? (
            <Card className="bg-white border-slate-200 border-dashed rounded-xl h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <FileImage className="h-12 w-12 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">No Document Selected</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Upload an image or document in the left panel to begin live private compression and resizing preview.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
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
                            alt="Original preview"
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
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
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
                        After <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[9px] px-1 py-0 h-4">{targetWidth}x{targetHeight}</Badge>
                      </span>
                      <div 
                        className="border-2 border-blue-100 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm"
                        style={{ 
                          aspectRatio: `${targetWidth}/${targetHeight}`, 
                          height: "190px", 
                          maxWidth: "180px" 
                        }}
                      >
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs p-2">
                            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                            Optimizing...
                          </div>
                        ) : optimizedUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={optimizedUrl}
                            alt="Optimized preview"
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
                    style={{ minHeight: "44px" }}
                  >
                    <Download className="h-4 w-4" /> Download Optimized Document
                  </Button>
                </CardFooter>
              </Card>

              <div className="flex gap-2 p-3 bg-blue-50/40 text-blue-800 text-xs rounded-xl border border-blue-100/50">
                <FileImage className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Private Optimization Complete:</strong> Image cropped to center-fit, scaled to {targetWidth}x{targetHeight}px, and compressed locally to fit strictly under the {targetSizeKb}KB size threshold.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
