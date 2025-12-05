const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Project images to upload
// Format: { local: 'path/to/local/file.png', publicId: 'cloudinary-public-id' }
const projectImages = [
  // Local images that need to be uploaded
  { local: 'public/projects/astro-ai.png', publicId: 'projects/astro-ai' },
  { local: 'public/projects/mbti-matching.png', publicId: 'projects/mbti-matching' },
  { local: 'public/projects/fine-tuned-chatbot.png', publicId: 'projects/fine-tuned-chatbot' },

  // Images already on Cloudinary (will re-upload with eager transformations)
  { local: 'public/projects/voice-uxr.png', publicId: 'projects/voice-uxr' },
  { local: 'public/projects/marketing-analytics-dashboard.png', publicId: 'projects/marketing-analytics-dashboard' },
  { local: 'public/projects/poll-engine.png', publicId: 'projects/poll-engine' },
  { local: 'public/projects/web-onboarding.png', publicId: 'projects/web-onboarding' },
  { local: 'public/projects/newsletter-generator.png', publicId: 'projects/newsletter-generator' },
  { local: 'public/projects/lecture-lens.png', publicId: 'projects/lecture-lens' },
  { local: 'public/projects/foggy-rainwater-text.png', publicId: 'projects/foggy-rainwater-text' },
];

/**
 * Upload images to Cloudinary with eager transformations
 * This pre-generates the transformed versions so they're cached permanently
 */
async function uploadWithEager() {
  console.log('🚀 Starting Cloudinary upload with eager transformations...\n');
  console.log(`Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  console.log(`Total images to process: ${projectImages.length}\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const [index, img] of projectImages.entries()) {
    const progress = `[${index + 1}/${projectImages.length}]`;

    try {
      // Check if local file exists
      if (!fs.existsSync(img.local)) {
        console.log(`${progress} ⏭️  SKIPPED: ${img.publicId} (file not found: ${img.local})`);
        skippedCount++;
        continue;
      }

      console.log(`${progress} ⏳ Uploading: ${img.publicId}`);

      const result = await cloudinary.uploader.upload(img.local, {
        public_id: img.publicId,
        overwrite: true, // Replace if already exists
        invalidate: true, // Invalidate CDN cache
        eager: [
          // Pre-generate transformed versions with inline transformations
          {
            transformation: [
              { aspect_ratio: "16:9", crop: "fill_pad", gravity: "auto", background: "auto" },
              { width: 1920, height: 1080, quality: "auto:best", fetch_format: "auto" }
            ]
          },
          {
            transformation: [
              { aspect_ratio: "16:9", crop: "fill_pad", gravity: "auto" },
              { width: 800, height: 450, quality: "auto:good", fetch_format: "auto" }
            ]
          }
        ],
        eager_async: false, // Wait for transformations to complete
        eager_notification_url: null, // No webhook needed
      });

      console.log(`${progress} ✅ SUCCESS: ${img.publicId}`);
      console.log(`   📦 Original: ${result.bytes} bytes (${(result.bytes / 1024).toFixed(2)} KB)`);
      console.log(`   🔗 URL: ${result.secure_url}`);
      console.log(`   🎨 Eager variants: ${result.eager ? result.eager.length : 0}`);

      if (result.eager && result.eager.length > 0) {
        result.eager.forEach((eager, i) => {
          console.log(`      ${i + 1}. ${eager.transformation} - ${(eager.bytes / 1024).toFixed(2)} KB`);
        });
      }

      console.log('');
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`${progress} ❌ FAILED: ${img.publicId}`);
      console.error(`   Error: ${error.message}`);
      console.error('');
      failCount++;
    }
  }

  // Summary
  console.log('═'.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`📦 Total processed: ${successCount + failCount} / ${projectImages.length}`);
  console.log('═'.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Images are now cached on Cloudinary CDN!');
    console.log('💡 Next steps:');
    console.log('   1. Update projects-data.ts with Cloudinary public IDs');
    console.log('   2. Update CloudinaryImage component to use named transformations');
    console.log('   3. Test locally');
  }

  if (failCount > 0) {
    console.log('\n⚠️  Some uploads failed. Please check the errors above.');
    process.exit(1);
  }
}

// Validate environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.error('❌ Error: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not found in .env.local');
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_KEY) {
  console.error('❌ Error: CLOUDINARY_API_KEY not found in .env.local');
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Error: CLOUDINARY_API_SECRET not found in .env.local');
  console.error('💡 Add CLOUDINARY_API_SECRET to .env.local (found in Cloudinary dashboard)');
  process.exit(1);
}

// Run the upload
uploadWithEager().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
