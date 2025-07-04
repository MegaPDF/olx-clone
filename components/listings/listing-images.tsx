"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  MoreVertical,
  Grid3X3,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

interface ListingImagesProps {
  images: string[];
  title?: string;
  onImagesChange?: (images: string[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  uploadProgress?: number;
  editable?: boolean;
  maxImages?: number;
  showThumbnails?: boolean;
  className?: string;
}

export function ListingImages({
  images,
  title = "",
  onImagesChange,
  onUpload,
  uploadProgress = 0,
  editable = false,
  maxImages = 10,
  showThumbnails = true,
  className,
}: ListingImagesProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!onUpload || !editable) return;

      const remainingSlots = maxImages - images.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      await onUpload(filesToUpload);
    },
    [onUpload, images.length, maxImages, editable]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: maxImages - images.length,
    disabled: !editable || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    if (!onImagesChange || !editable) return;

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // Adjust current index if necessary
    if (currentIndex >= newImages.length && newImages.length > 0) {
      setCurrentIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentIndex(0);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!onImagesChange || !editable) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_image.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const shareImage = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: imageUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(imageUrl);
    }
  };

  // Upload area for editable mode
  if (editable && images.length === 0) {
    return (
      <div className={className}>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">{t("listings:uploadPhotos")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("listings:uploadDescription", { max: maxImages })}
          </p>
          <Button type="button">{t("listings:selectPhotos")}</Button>
        </div>

        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">{t("common:uploading")}</span>
              <span className="text-sm">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "bg-muted rounded-lg aspect-[4/3] flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-muted-foreground">
          <Grid3X3 className="mx-auto h-12 w-12 mb-2" />
          <p>{t("listings:noImages")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main image display */}
      <div className="relative group">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <img
            src={images[currentIndex]}
            alt={`${title} - ${t("common:image")} ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Image overlay controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Top controls */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {title} - {t("common:image")} {currentIndex + 1}{" "}
                      {t("common:of")} {images.length}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <img
                      src={images[currentIndex]}
                      alt={`${title} - ${t("common:image")} ${
                        currentIndex + 1
                      }`}
                      className="w-full max-h-[70vh] object-contain"
                    />

                    {images.length > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={prevImage}>
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          {t("common:previous")}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {currentIndex + 1} / {images.length}
                        </span>
                        <Button variant="outline" size="sm" onClick={nextImage}>
                          {t("common:next")}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                onClick={() => downloadImage(images[currentIndex])}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                onClick={() => shareImage(images[currentIndex])}
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {editable && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-600"
                  onClick={() => removeImage(currentIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative aspect-square rounded overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={image}
                alt={`${title} - ${t("common:thumbnail")} ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {editable && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-4 w-4 p-0 opacity-0 hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </button>
          ))}

          {/* Add more button */}
          {editable && images.length < maxImages && (
            <div
              {...getRootProps()}
              className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input {...getInputProps()} />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      )}

      {/* Upload progress */}
      {editable && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{t("common:uploading")}</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload area for additional images */}
      {editable && images.length > 0 && images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("listings:addMorePhotos", {
              current: images.length,
              max: maxImages,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
