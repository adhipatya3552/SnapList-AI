"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Zap, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onAnalyze: (files: File[]) => void;
  isLoading: boolean;
  maxFiles?: number;
}

export function ImageUploader({ onAnalyze, isLoading, maxFiles = 10 }: ImageUploaderProps) {
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newFiles = accepted.slice(0, maxFiles - files.length).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
    },
    [files.length, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    maxFiles,
    disabled: isLoading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAnalyze = () => {
    if (files.length > 0) onAnalyze(files.map((f) => f.file));
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300",
          isDragActive
            ? "border-[var(--violet)] bg-[var(--violet-glow)] scale-[1.01]"
            : "border-[var(--border)] hover:border-[var(--violet)] hover:bg-[rgba(124,58,237,0.05)]",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
              isDragActive ? "bg-[var(--violet)] glow-violet" : "bg-[var(--bg-elevated)]"
            )}
          >
            {isDragActive ? (
              <Zap className="h-8 w-8 text-white" />
            ) : (
              <Camera className="h-8 w-8 text-[var(--violet-light)]" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {isDragActive ? "Drop to analyze!" : "Drag & drop your product photos"}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              or <span className="text-[var(--violet-light)] underline-offset-2 hover:underline">browse files</span>
              &nbsp;— up to {maxFiles} photos at once
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">JPG, PNG, WEBP, HEIC supported</p>
          </div>
        </motion.div>
      </div>

      {/* Preview Strip */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap gap-3">
              {files.map(({ preview }, i) => (
                <motion.div
                  key={preview}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`Item ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-white">
                    #{i + 1}
                  </div>
                </motion.div>
              ))}

              {/* Add more */}
              {files.length < maxFiles && (
                <div
                  {...getRootProps()}
                  className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--violet)] hover:bg-[rgba(124,58,237,0.05)] transition-all"
                >
                  <Plus className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isLoading}
              className={cn(
                "w-full rounded-xl py-4 font-semibold text-white transition-all duration-300",
                "bg-gradient-to-r from-[var(--violet)] to-[#9333EA]",
                "hover:from-[#6D28D9] hover:to-[#7C3AED]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg shadow-[var(--violet-glow)]"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing {files.length} {files.length === 1 ? "item" : "items"}…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Analyze {files.length} {files.length === 1 ? "item" : "items"} with AI
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
