"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number }

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg")
    })
  } catch (error) {
    console.error("Error in getCroppedImg:", error)
    return null
  }
}

interface ProfilePictureUploadProps {
  value?: string | null
  onChange?: (value: string | null) => void
  error?: boolean
}

export function AvatarUpload({
  value,
  onChange,
  error
}: ProfilePictureUploadProps) {
  const [
    { files, isDragging },
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
    accept: "image/*",
  })

  const previewUrl = files[0]?.preview || null
  const fileId = files[0]?.id

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const previousFileIdRef = useRef<string | undefined | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [zoom, setZoom] = useState(1)

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        previewUrl,
        fileId,
        croppedAreaPixels,
      })
      if (fileId) {
        removeFile(fileId)
        setCroppedAreaPixels(null)
      }
      return
    }

    try {
      const croppedBlob = await getCroppedImage(previewUrl, croppedAreaPixels)

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.")
      }

      const newFinalUrl = URL.createObjectURL(croppedBlob)

      // Revoke the old URL if it exists
      if (value) {
        URL.revokeObjectURL(value)
      }

      // Update the parent form via onChange
      onChange?.(newFinalUrl)

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error during apply:", error)
      setIsDialogOpen(false)
    }
  }

  const handleRemoveFinalImage = () => {
    // Only revoke blob URLs, not regular URLs from server
    if (value && value.startsWith('blob:')) {
      URL.revokeObjectURL(value)
    }
    onChange?.(null)
  }

  // Effect to open dialog when a new file is ready
  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true)
      setCroppedAreaPixels(null)
      setZoom(1)
    }
    previousFileIdRef.current = fileId
  }, [fileId])

  return (
    <>
      <div className="relative inline-flex">
        <button
          type="button"
          className={`border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none ${error ? "border-destructive" : ""
            }`}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={value ? "Change image" : "Upload image"}
        >
          {value ? (
            <img
              className="size-full object-cover"
              src={value}
              alt="Profile picture"
              width={80}
              height={80}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="text-muted-foreground size-6" />
            </div>
          )}
        </button>
        {value && (
          <Button
            type="button"
            onClick={handleRemoveFinalImage}
            size="icon"
            className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button
                type="button"
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl}
                autoFocus
              >
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription>Drag to reposition the image and use the zoom slider below to adjust the size</CropperDescription>
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
