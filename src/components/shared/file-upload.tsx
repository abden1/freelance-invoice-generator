"use client";

import * as React from "react";
import { Upload, X, FileImage, File, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in bytes, default 5MB
  label?: string;
  className?: string;
  disabled?: boolean;
  currentFileUrl?: string;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function FileUpload({
  onUpload,
  accept = "image/*,application/pdf",
  maxSize = DEFAULT_MAX_SIZE,
  label = "Upload a file",
  className,
  disabled = false,
  currentFileUrl,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentFileUrl ?? null
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function validateFile(file: File): string | null {
    if (file.size > maxSize) {
      return `File size exceeds ${formatBytes(maxSize)}. Please choose a smaller file.`;
    }

    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", "/"));
        }
        return file.type === type || file.name.endsWith(type.replace("*", ""));
      });

      if (!isAccepted) {
        return `File type not supported. Accepted: ${accept}`;
      }
    }

    return null;
  }

  async function handleFile(file: File) {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    if (isImageFile(file)) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPreviewUrl(currentFileUrl ?? null);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleRemove() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  }

  function handleClick() {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }

  const hasPreview = previewUrl !== null;

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled || isUploading}
        aria-label={label}
      />

      {/* Drop Zone */}
      {!hasPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-disabled={disabled || isUploading}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
            (disabled || isUploading) &&
              "cursor-not-allowed opacity-60",
            !disabled && !isUploading && "cursor-pointer"
          )}
        >
          {isUploading ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 animate-bounce text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Uploading...
                </p>
                <p className="text-xs text-muted-foreground">
                  Please wait while your file is being uploaded.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Drop file here" : label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag and drop or{" "}
                  <span className="font-medium text-primary underline-offset-2 hover:underline">
                    click to browse
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Max size: {formatBytes(maxSize)}
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border bg-muted/30">
          {/* Image preview */}
          {previewUrl && selectedFile && isImageFile(selectedFile) ? (
            <div className="relative aspect-video w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="File preview"
                className="h-full w-full object-contain"
              />
            </div>
          ) : previewUrl && !selectedFile && currentFileUrl ? (
            /* Show current file URL as image if it looks like an image */
            <div className="relative aspect-video w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Current file"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            /* Non-image file preview */
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedFile?.name ?? "Uploaded file"}
                </p>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between border-t bg-background/80 px-3 py-2 backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className="h-7 text-xs"
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
