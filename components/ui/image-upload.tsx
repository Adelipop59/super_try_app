"use client"

import { useState, useCallback } from "react"
import { X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(value)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image (PNG, JPG, GIF, WEBP)")
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Créer une preview locale
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload vers Supabase Storage
      const formData = new FormData()
      formData.append("file", file)

      // Cookies are sent automatically, no need to pass token manually
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Send cookies automatically
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        console.error("Upload error:", errorData)
        const errorMessage = errorData.error || "Upload failed"
        setError(errorMessage)
        setPreview(undefined)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Upload success:", data)
      onChange(data.url)
    } catch (error) {
      console.error("Upload error:", error)
      if (!error) {
        setError("Erreur lors de l'upload")
      }
      setPreview(undefined)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || isUploading) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, isUploading]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    if (disabled || isUploading) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    }
    input.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(undefined)
    onChange("")
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && !isUploading && "cursor-pointer hover:border-primary/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {!disabled && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
          {isUploading ? (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Upload en cours...</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-3">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Glissez une image ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </div>
              {error && (
                <div className="mt-2 rounded-md bg-destructive/10 px-3 py-2">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
