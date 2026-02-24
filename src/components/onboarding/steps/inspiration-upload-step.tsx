"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  ImageIcon,
  Globe,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

interface UploadedImage {
  id: string;
  fileName: string;
  url: string;
  note: string;
}

interface InspirationData {
  urls: string[];
  notes: string;
  images: UploadedImage[];
}

export function InspirationUploadStep({ projectId, data, onSave, onNext, onPrev, token, magicToken }: StepProps) {
  const existingData = data as InspirationData | undefined;
  const [urls, setUrls] = useState<string[]>(existingData?.urls ?? [""]);
  const [notes, setNotes] = useState(existingData?.notes ?? "");
  const [images, setImages] = useState<UploadedImage[]>(existingData?.images ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authToken = magicToken || token;

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildFormData = useCallback((): InspirationData => ({
    urls: urls.filter((u) => u.trim() !== ""),
    notes,
    images,
  }), [urls, notes, images]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("inspiration_upload", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (images.length > 0 || notes || urls.some((u) => u.trim())) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [urls, notes, images, autoSave]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!authToken) return;
    setUploadError(null);
    setIsUploading(true);

    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let completed = 0;

    for (const file of fileArray) {
      const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`${file.name}: Invalid file type. Use PNG, JPG, GIF, or WebP.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`${file.name}: File too large (max 10MB).`);
        continue;
      }

      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 2048,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("file", compressedFile, file.name);
        formData.append("category", "inspiration");

        const res = await fetch(
          `/api/projects/${projectId}/upload?token=${encodeURIComponent(authToken)}`,
          { method: "POST", body: formData }
        );

        if (!res.ok) {
          const err = await res.json();
          setUploadError(err.error || `Failed to upload ${file.name}`);
          continue;
        }

        const { asset } = await res.json();
        setImages((prev) => [
          ...prev,
          { id: asset.id, fileName: asset.file_name, url: asset.url, note: "" },
        ]);

        completed++;
        setUploadProgress((completed / totalFiles) * 100);
      } catch {
        setUploadError(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [projectId, authToken]);

  async function handleDeleteImage(imageId: string) {
    if (!authToken) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/upload?token=${encodeURIComponent(authToken)}&assetId=${imageId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch {
      console.error("Failed to delete image");
    }
  }

  function updateImageNote(imageId: string, note: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, note } : img))
    );
  }

  async function handleNext() {
    await onSave("inspiration_upload", buildFormData());
    onNext();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="inspiration-upload-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-2">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Inspiration</h2>
        <p className="text-muted-foreground">
          Share designs, websites, or images that inspire you. This helps your designer understand your taste.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div>
        <h3 className="mb-2 text-sm font-medium">Upload Inspiration Images</h3>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center text-muted-foreground cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
              : "hover:border-primary/50 hover:bg-muted/30"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            "mb-3 p-3 rounded-full transition-colors",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn("h-6 w-6", isDragging && "text-primary")} />
          </div>
          <p className="text-sm font-medium">
            {isDragging ? "Drop images here!" : "Drag & drop images here, or click to browse"}
          </p>
          <p className="mt-1 text-xs">PNG, JPG, GIF, WebP up to 10MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>

        {isUploading && (
          <div className="mt-3">
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>
          </div>
        )}

        {uploadError && (
          <p className="mt-2 text-sm text-destructive">{uploadError}</p>
        )}
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative rounded-xl border overflow-hidden group transition-shadow hover:shadow-md"
              >
                {image.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="p-2">
                  <Input
                    value={image.note}
                    onChange={(e) => updateImageNote(image.id, e.target.value)}
                    placeholder="What do you like about this?"
                    className="h-11 text-base sm:text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL References */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Websites or URLs you admire</h3>
        </div>
        <div className="space-y-2">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrls((prev) => prev.map((u, i) => (i === index ? e.target.value : u)))}
                placeholder="https://example.com"
                className="h-11 text-base"
              />
              {urls.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUrls((prev) => prev.filter((_, i) => i !== index))}
                  className="h-11 w-11"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {urls.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUrls((prev) => [...prev, ""])}
              className="border-dashed"
            >
              <Plus className="h-4 w-4 mr-1" /> Add another URL
            </Button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="mb-2 text-sm font-medium">What do you like about these?</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us what catches your eye — colors, layouts, typography, overall feel..."
          rows={4}
          className="resize-none text-base"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} className="h-12 px-8">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
