"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  User,
  Package,
  Building,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackType?: "avatar" | "listing" | "logo" | "generic" | "custom";
  fallbackSrc?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  showLoader?: boolean;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  unoptimized?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  rounded?: boolean | "sm" | "md" | "lg" | "full";
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  fallbackType = "generic",
  fallbackSrc,
  fallbackIcon,
  fallbackText,
  showLoader = true,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder,
  blurDataURL,
  unoptimized = false,
  onLoad,
  onError,
  objectFit = "cover",
  rounded = false,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
      setIsLoading(true);
      setRetryCount(0);
    } else {
      setImgSrc(null);
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);

    // Try fallback source first
    if (fallbackSrc && imgSrc !== fallbackSrc && retryCount === 0) {
      setImgSrc(fallbackSrc);
      setRetryCount(1);
      return;
    }

    // Retry original source once
    if (src && retryCount < maxRetries && imgSrc !== src) {
      setRetryCount((prev) => prev + 1);
      setImgSrc(src);
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = src;
        }
      }, 1000);
      return;
    }

    setHasError(true);
    onError?.();
  };

  const getFallbackIcon = () => {
    if (fallbackIcon) return fallbackIcon;

    const iconClass = "h-8 w-8 text-muted-foreground";

    switch (fallbackType) {
      case "avatar":
        return <User className={iconClass} />;
      case "listing":
        return <Package className={iconClass} />;
      case "logo":
        return <Building className={iconClass} />;
      case "generic":
      default:
        return <ImageIcon className={iconClass} />;
    }
  };

  const getRoundedClass = () => {
    if (!rounded) return "";

    switch (rounded) {
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      case true:
        return "rounded";
      default:
        return "";
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case "contain":
        return "object-contain";
      case "fill":
        return "object-fill";
      case "none":
        return "object-none";
      case "scale-down":
        return "object-scale-down";
      case "cover":
      default:
        return "object-cover";
    }
  };

  const containerClass = cn(
    "relative overflow-hidden bg-muted flex items-center justify-center",
    getRoundedClass(),
    className
  );

  const imageClass = cn(getObjectFitClass(), getRoundedClass());

  // If no valid source and showing error state
  if (!imgSrc || hasError) {
    return (
      <div
        className={containerClass}
        style={fill ? undefined : { width, height }}
        {...props}
      >
        {fallbackText ? (
          <div className="text-center p-4">
            {getFallbackIcon()}
            <p className="mt-2 text-sm text-muted-foreground">{fallbackText}</p>
          </div>
        ) : (
          getFallbackIcon()
        )}
      </div>
    );
  }

  // Show loading state
  if (isLoading && showLoader) {
    return (
      <div
        className={containerClass}
        style={fill ? undefined : { width, height }}
        {...props}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <Image
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          unoptimized={unoptimized}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(imageClass, "opacity-0")}
          {...props}
        />
      </div>
    );
  }

  // Show image
  return (
    <div
      className={containerClass}
      style={fill ? undefined : { width, height }}
    >
      <Image
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        unoptimized={unoptimized}
        onLoad={handleLoad}
        onError={handleError}
        className={imageClass}
        {...props}
      />
    </div>
  );
}

// Convenience components for common use cases
export function Avatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<
  ImageWithFallbackProps,
  "fallbackType" | "width" | "height" | "rounded"
> & {
  size?: number;
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={size}
      height={size}
      fallbackType="avatar"
      rounded="full"
      className={cn("flex-shrink-0", className)}
      {...props}
    />
  );
}

export function ListingImage({
  src,
  alt,
  width = 300,
  height = 200,
  className,
  ...props
}: Omit<ImageWithFallbackProps, "fallbackType">) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallbackType="listing"
      rounded="md"
      className={className}
      {...props}
    />
  );
}

export function Logo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
  ...props
}: Omit<ImageWithFallbackProps, "fallbackType" | "objectFit">) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallbackType="logo"
      objectFit="contain"
      className={className}
      {...props}
    />
  );
}

export function ProductImage({
  src,
  alt,
  size = 200,
  className,
  ...props
}: Omit<
  ImageWithFallbackProps,
  "fallbackType" | "width" | "height" | "rounded"
> & {
  size?: number;
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={size}
      height={size}
      fallbackType="listing"
      rounded="lg"
      className={className}
      {...props}
    />
  );
}

export function CoverImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImageWithFallbackProps, "fill" | "objectFit">) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      fill
      objectFit="cover"
      fallbackType="generic"
      className={cn("w-full h-full", className)}
      {...props}
    />
  );
}
