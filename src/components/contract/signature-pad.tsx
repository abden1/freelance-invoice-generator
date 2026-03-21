"use client";

import { useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureChange?: (signature: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function SignaturePad({ onSignatureChange, className, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    if (pos) {
      lastPos.current = pos;
      setIsEmpty(false);
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;

    const pos = getPos(e);
    if (!pos) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;

    if (!isEmpty && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSignatureChange?.(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange?.(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDrawing ? "border-primary" : "border-muted-foreground/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "w-full h-40 rounded-lg touch-none",
            disabled ? "cursor-not-allowed" : "cursor-crosshair"
          )}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">
              {disabled ? "Signature area" : "Sign here..."}
            </p>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Draw your signature in the box above
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={isEmpty}
            className="h-7 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
