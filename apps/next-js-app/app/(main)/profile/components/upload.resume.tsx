"use client"

import { useCallback, useEffect } from "react"
import { FileTextIcon, UploadIcon, XIcon } from "lucide-react"

import { useFileUpload, formatBytes } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"

interface ResumeUploadProps {
  value?: string | File | null  // Can be a URL string or File object
  onChange?: (value: File | string | null) => void
  error?: boolean
}

export function ResumeUpload({ value, onChange, error }: ResumeUploadProps) {
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Sync form field value whenever files change (post-render)
  useEffect(() => {
    const first = files[0]
    if (!first) {
      // Don't clear if there's an existing URL value
      if (value && typeof value !== 'string') {
        onChange?.(null)
      }
      return
    }
    const file = first.file as File
    // Store the actual File object instead of just the name
    if (file && file !== value) onChange?.(file)
  }, [files, onChange, value])

  const currentFile = files[0]
  const hasFile = Boolean(currentFile || value)
  const isExistingFile = typeof value === 'string' && value.length > 0 && !currentFile

  const handleRemove = useCallback(() => {
    if (currentFile?.id) {
      removeFile(currentFile.id)
    }
    onChange?.(null)
  }, [currentFile, removeFile, onChange])

  const inputProps = getInputProps()
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange?.(e)
      const file = e.target.files?.[0]
      if (file) {
        // Store the actual File object
        onChange?.(file)
      }
    },
    [inputProps, onChange]
  )

  const dropZoneClasses = [
    "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors outline-none",
    "hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 has-[input:focus]:ring-[3px]",
    error ? "border-destructive" : "border-input",
    isDragging && "bg-accent/80",
    hasFile && "pointer-events-none opacity-50"
  ].filter(Boolean).join(" ")

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        role="button"
        onClick={hasFile ? undefined : openFileDialog}
        onDragEnter={hasFile ? undefined : handleDragEnter}
        onDragLeave={hasFile ? undefined : handleDragLeave}
        onDragOver={hasFile ? undefined : handleDragOver}
        onDrop={hasFile ? undefined : handleDrop}
        className={dropZoneClasses}
        aria-label="Upload resume file - click to browse or drag and drop"
        aria-disabled={hasFile}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full">
            <UploadIcon className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm">
              <span className="text-primary">Click to upload or drag and drop</span>
            </p>
            <p className="text-muted-foreground text-xs">
              PDF, DOC, or DOCX (max 10MB)
            </p>
          </div>
        </div>
        <input
          {...inputProps}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload resume file"
          disabled={hasFile}
        />
      </div>

      {errors.length > 0 && (
        <p className="text-destructive text-sm">{errors[0]}</p>
      )}

      {hasFile && (
        <div className="border-input flex items-center justify-between rounded-lg border px-4 py-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileTextIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {currentFile?.file.name || (value instanceof File ? value.name : isExistingFile ? 'resume.pdf' : value)}
              </p>
              {currentFile?.file.size && (
                <p className="text-muted-foreground text-xs">
                  {formatBytes(currentFile.file.size)}
                </p>
              )}
              {isExistingFile && (
                <a
                  href={value as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View current resume
                </a>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-muted-foreground/80 hover:text-foreground -me-2 h-8 w-8 hover:bg-transparent shrink-0"
            aria-label="Remove file"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}