"use client"

import { CldImage, CldImageProps } from "next-cloudinary"
import Image from "next/image"
import { useState } from "react"

interface CloudinaryImageProps extends Omit<CldImageProps, "src"> {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  onError?: () => void
  sizes?: string
  style?: React.CSSProperties
}

/**
 * Cloudinary Image Component
 * 
 * Automatically uses Cloudinary for optimization when configured.
 * Falls back to Next.js Image for local images if Cloudinary is not configured.
 * 
 * Setup:
 * 1. Sign up at https://cloudinary.com/users/register_free
 * 2. Get your cloud name, API key, and API secret from dashboard
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 */
export function CloudinaryImage({
  src,
  alt,
  fill = false,
  priority = false,
  className,
  onError,
  sizes,
  style,
  ...props
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Check if Cloudinary is configured
  const cloudinaryConfigured = 
    typeof process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "undefined" &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== ""

  // Extract public ID from Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  // Or: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{public_id}.{format}
  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      // Parse URL to extract public ID
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean) // Remove empty strings
      
      // Find 'upload' index
      const uploadIndex = pathParts.indexOf('upload')
      
      if (uploadIndex === -1 || uploadIndex >= pathParts.length - 1) {
        return null
      }
      
      // Get everything after 'upload'
      const afterUpload = pathParts.slice(uploadIndex + 1)
      
      // The last part is always the public ID (with optional extension)
      // Parts before that could be version (v123) or transformations
      const publicIdWithExt = afterUpload[afterUpload.length - 1]
      
      if (!publicIdWithExt) {
        return null
      }
      
      // Remove file extension if present
      const publicId = publicIdWithExt.replace(/\.[^.]+$/, '')
      
      return publicId || null
    } catch (error) {
      console.error('Error extracting Cloudinary public ID:', error)
      return null
    }
  }

  // Determine if src is a Cloudinary URL, public ID, local path, or external URL
  const isCloudinaryUrl = src.includes('res.cloudinary.com')
  const isLocalPath = src.startsWith("/")
  const isHttpUrl = (src.startsWith("http://") || src.startsWith("https://")) && !isCloudinaryUrl
  const isCloudinaryId = !isLocalPath && !isHttpUrl && !isCloudinaryUrl

  // Handle errors
  const handleError = () => {
    if (cloudinaryConfigured && !isLocalPath) {
      setHasError(true)
    } else {
      setUseFallback(true)
    }
    onError?.()
  }

  // If Cloudinary not configured or using local images, fallback to Next.js Image
  if (!cloudinaryConfigured || (isLocalPath && useFallback)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        className={className}
        quality={100}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
        style={style}
      />
    )
  }

  // Process image source based on type
  let imageSrc: string
  
  if (isCloudinaryUrl) {
    // Extract public ID from Cloudinary URL for better optimization
    const publicId = extractPublicIdFromUrl(src)
    if (publicId) {
      // Use public ID for better Cloudinary optimization
      imageSrc = publicId
    } else {
      // Fallback: Try using the full URL directly
      // CldImage might handle it, but public ID is preferred
      console.warn('Could not extract public ID from Cloudinary URL, using full URL:', src)
      imageSrc = src
    }
  } else if (isLocalPath) {
    // In production, Cloudinary can fetch from your deployed domain
    // For development, consider uploading images to Cloudinary
    if (process.env.NODE_ENV === "production") {
      imageSrc = `fetch:${src}`
    } else {
      // In development, fallback to Next.js Image for local files
      return (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          priority={priority}
          className={className}
          quality={100}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          onError={handleError}
          style={style}
        />
      )
    }
  } else if (isHttpUrl) {
    // External URL - use fetch: prefix
    imageSrc = `fetch:${src}`
  } else {
    // Cloudinary public ID (already in correct format)
    imageSrc = src
  }

  if (hasError) {
    return null
  }

  // Calculate max dimensions to stay under Cloudinary's 25MP free tier limit
  // Container is h-80 (320px) md:h-96 (384px), max width ~1200px for cards
  // 25MP = 25,000,000 pixels
  // Safe max: 1920x1280 = ~2.46MP (well under 25MP limit)
  // CRITICAL: AI features (enhance, restore) process ORIGINAL image before resize
  // Solution: Use rawTransformations to resize FIRST when using fill
  
  // Standardize aspect ratio to 16:9 for consistent image sizes
  // This ensures all images appear the same size when displayed together
  // Using ar_16:9 with c_fill and g_auto for intelligent cropping
  const aspectRatio = "16:9"
  const maxWidth = 1920
  const maxHeight = 1080 // 1920 / 16 * 9 = 1080 (maintains 16:9)

  // When using fill, CANNOT use width/height props (Next.js restriction)
  // Must use rawTransformations to resize FIRST before any processing
  // Put ALL transformations in rawTransformations to ensure proper order
  if (fill) {
    return (
      <CldImage
        src={imageSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        className={className}
        // CRITICAL: Use fill_pad mode - the BEST solution for preserving content
        // fill_pad tries smart cropping first, then adds padding if needed to preserve content
        // This ensures consistent 16:9 aspect ratio while preserving full image content
        // Requires g_auto (AI gravity) to work - finds best focal point
        // b_auto = automatically match padding color to image content (seamless blend)
        rawTransformations={[
          // fill_pad mode: Smart cropping with intelligent padding fallback
          // ar_16:9 = enforce 16:9 aspect ratio
          // c_fill_pad = tries fill mode first, adds padding if crop would cut important content
          // g_auto = AI-powered gravity (REQUIRED for fill_pad, finds best focal point)
          // b_auto = auto background color (matches image for seamless padding)
          // w_1920,h_1080 = max dimensions (stays under 25MP limit, maintains 16:9)
          `ar_${aspectRatio},c_fill_pad,g_auto,b_auto,w_${maxWidth},h_${maxHeight}`,
        ]}
        // Quality and format optimization
        quality="auto:best"
        format="auto"
        // Limit DPR to prevent exceeding size limits
        dpr={2}
        // AI features: Enable AFTER resize in rawTransformations
        // Since rawTransformations are applied first, these should work on resized image
        enhance={true}
        restore={true}
        autoContrast={true}
        // Loading strategy
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        onError={handleError}
        style={style}
        {...props}
      />
    )
  }

  // Non-fill mode: use explicit dimensions
  return (
    <CldImage
      src={imageSrc}
      alt={alt}
      width={maxWidth}
      height={maxHeight}
      priority={priority}
      className={className}
      crop="limit"
      gravity="auto"
      quality="auto:best"
      format="auto"
      dpr={2}
      // AI features enabled for non-fill mode
      enhance={true}
      restore={true}
      autoContrast={true}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      onError={handleError}
      style={style}
      {...props}
    />
  )
}

