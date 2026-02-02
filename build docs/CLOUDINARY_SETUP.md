# Cloudinary Setup Guide

This project uses **Cloudinary** for advanced image optimization, automatic format conversion, and AI-powered enhancements.

## Benefits

- ✅ **Automatic Optimization**: Images are automatically optimized for best quality and performance
- ✅ **Format Conversion**: Automatically serves WebP/AVIF when supported
- ✅ **Smart Cropping**: AI-powered cropping and resizing
- ✅ **Quality Control**: `auto:best` quality setting ensures maximum readability
- ✅ **CDN Delivery**: Fast global delivery via Cloudinary's CDN
- ✅ **Responsive Images**: Automatic responsive image generation

## Setup Instructions

### 1. Create Cloudinary Account (Free)

1. Go to https://cloudinary.com/users/register_free
2. Sign up for a free account (includes 25GB storage and 25GB bandwidth/month)
3. Verify your email

### 2. Get Your Credentials

1. Log in to https://cloudinary.com/console
2. Copy your **Cloud Name** (visible on dashboard)
3. Copy your **API Key** (visible on dashboard)
4. Copy your **API Secret** (click "Reveal" to show)

### 3. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: 
- `NEXT_PUBLIC_` prefix is required for client-side access
- Never commit `.env.local` to git (it's already in `.gitignore`)

### 4. Using Local Images

The current implementation supports local images in your `public/` folder. Cloudinary will fetch them using the `fetch:` prefix.

**For best performance**, consider uploading images to Cloudinary:

1. Go to Cloudinary Media Library
2. Upload your project images
3. Update image paths in `components/projects/projects-data.ts` to use Cloudinary public IDs instead of `/projects/...` paths

Example:
```typescript
// Before (local)
image: "/projects/astro-ai.png"

// After (Cloudinary)
image: "projects/astro-ai"  // Cloudinary public ID
```

### 5. Restart Development Server

After adding environment variables:

```bash
npm run dev
```

## Image Quality Settings

The component uses these Cloudinary settings:
- **Quality**: `auto:best` - Automatically selects best quality while optimizing file size
- **Format**: `auto` - Serves WebP/AVIF when supported, falls back to original
- **DPR**: `auto` - Automatically adjusts for high-DPI displays
- **Crop**: `limit` - Maintains aspect ratio, no cropping

## Troubleshooting

### Images Not Loading

1. **Check environment variables**: Ensure all three are set correctly
2. **Check Cloudinary dashboard**: Verify your account is active
3. **Check browser console**: Look for Cloudinary-related errors

### Local Images Not Working

If local images (starting with `/`) aren't loading:
1. Ensure your site is accessible (Cloudinary needs to fetch from your domain)
2. For development, you may need to upload images to Cloudinary instead
3. Or use Cloudinary's upload API to upload local images

### Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: Unlimited
- **Uploads**: 25GB/month

For a portfolio site, this is usually more than enough!

## Advanced Features (Already Enabled!)

The component automatically uses these Cloudinary AI-powered features:

✅ **AI Image Enhancement** (`enhance={true}`)
   - Automatically improves image sharpness, clarity, and visual appeal
   - Perfect for making screenshots and UI images more readable

✅ **AI Image Restoration** (`restore={true}`)
   - Restores details in compressed or degraded images
   - Improves quality of images that have been resized multiple times

✅ **Auto Gravity Detection** (`gravity="auto"`)
   - AI automatically detects the most important part of the image
   - Ensures important content stays visible when images are resized

✅ **Auto Contrast** (`autoContrast={true}`)
   - Automatically adjusts contrast for better text readability
   - Especially useful for screenshots with text/UI elements

✅ **Smart Quality** (`quality="auto:best"`)
   - Automatically selects the best quality while optimizing file size
   - Balances visual quality with performance

✅ **Format Optimization** (`format="auto"`)
   - Automatically serves WebP/AVIF when supported
   - Falls back to original format for older browsers

✅ **High-DPI Support** (`dpr="auto"`)
   - Automatically serves higher resolution images for Retina displays
   - Ensures crisp images on all devices

## Additional Features You Can Enable

If needed, you can add these features to the component:

- **AI Background Removal**: `removeBackground={true}`
- **Custom Cropping**: Change `crop="limit"` to `crop="fill"` for fill cropping
- **Blur Effects**: `blur="800"` or `blurFaces={true}`
- **Grayscale**: `grayscale={true}`

See the component in `components/projects/cloudinary-image.tsx` for customization options.

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next Cloudinary Docs](https://next-cloudinary.photoeditorsdk.com/)
- [Cloudinary Console](https://cloudinary.com/console)

