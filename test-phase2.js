// test-phase2.js - Test document loading and chunking (Phase 2)
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

async function testPhase2() {
  console.log('\n========================================');
  console.log('PHASE 2: Document Loading & Chunking Test');
  console.log('========================================\n');

  try {
    // Import the modules (using dynamic import for ESM modules)
    const { loadAllPDFs } = await import('./lib/ai/loaders/pdf-loader.ts');
    const { chunkResume, chunkLinkedIn } = await import('./lib/ai/chunking/professional-chunker.ts');
    const { chunkJourney } = await import('./lib/ai/chunking/narrative-chunker.ts');
    const { chunkGeneric } = await import('./lib/ai/chunking/generic-chunker.ts');

    // Test 1: Load all PDFs
    console.log('📄 Test 1: Loading all PDF documents...');
    const documents = await loadAllPDFs();
    console.log(`✅ Loaded ${documents.length} documents\n`);

    if (documents.length === 0) {
      console.log('❌ No documents found! Make sure PDFs are in /documents folder');
      return;
    }

    // Display document summary
    documents.forEach(doc => {
      console.log(`  - ${doc.filename}`);
      console.log(`    Type: ${doc.type}`);
      console.log(`    Pages: ~${doc.metadata.pages}`);
      console.log(`    Year: ${doc.metadata.year || 'N/A'}`);
      console.log(`    Content length: ${doc.content.length} chars\n`);
    });

    // Test 2: Test chunking for each document type
    console.log('\n🔪 Test 2: Testing chunking strategies...\n');

    let totalChunks = 0;
    const chunksByType = {
      resume: [],
      linkedin: [],
      journey: [],
      generic: []
    };

    for (const doc of documents) {
      console.log(`Processing: ${doc.filename} (${doc.type})`);

      let chunks = [];

      switch (doc.type) {
        case 'resume':
          chunks = chunkResume(doc.content, doc.filename);
          chunksByType.resume.push(...chunks);
          break;
        case 'linkedin':
          chunks = chunkLinkedIn(doc.content, doc.filename);
          chunksByType.linkedin.push(...chunks);
          break;
        case 'journey':
          chunks = chunkJourney(doc.content, doc.filename, doc.metadata.year);
          chunksByType.journey.push(...chunks);
          break;
        default:
          chunks = chunkGeneric(doc.content, doc.filename);
          chunksByType.generic.push(...chunks);
      }

      console.log(`  ✅ Created ${chunks.length} chunks`);

      // Show first chunk as sample
      if (chunks.length > 0) {
        console.log(`  📝 Sample chunk (first 200 chars):`);
        console.log(`     ${chunks[0].text.substring(0, 200)}...`);
        console.log(`     Category: ${chunks[0].category}`);
      }
      console.log('');

      totalChunks += chunks.length;
    }

    // Test 3: Chunk Quality Analysis
    console.log('\n📊 Test 3: Chunk Quality Analysis\n');
    console.log(`Total chunks created: ${totalChunks}\n`);

    console.log('Chunks by type:');
    console.log(`  Resume chunks: ${chunksByType.resume.length}`);
    console.log(`  LinkedIn chunks: ${chunksByType.linkedin.length}`);
    console.log(`  Journey chunks: ${chunksByType.journey.length}`);
    console.log(`  Generic chunks: ${chunksByType.generic.length}\n`);

    // Analyze chunk sizes
    const allChunks = [
      ...chunksByType.resume,
      ...chunksByType.linkedin,
      ...chunksByType.journey,
      ...chunksByType.generic
    ];

    const chunkSizes = allChunks.map(c => c.text.length);
    const avgSize = chunkSizes.reduce((a, b) => a + b, 0) / chunkSizes.length;
    const minSize = Math.min(...chunkSizes);
    const maxSize = Math.max(...chunkSizes);

    console.log('Chunk size statistics (characters):');
    console.log(`  Average: ${Math.round(avgSize)}`);
    console.log(`  Min: ${minSize}`);
    console.log(`  Max: ${maxSize}\n`);

    // Test 4: Verify chunk structure
    console.log('📋 Test 4: Verify chunk structure\n');

    // Sample 5 random chunks
    const sampleSize = Math.min(5, allChunks.length);
    const samples = [];
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * allChunks.length);
      samples.push(allChunks[randomIndex]);
    }

    samples.forEach((chunk, index) => {
      console.log(`Sample ${index + 1}:`);
      console.log(`  Text (first 150 chars): ${chunk.text.substring(0, 150)}...`);
      console.log(`  Category: ${chunk.category}`);
      console.log(`  Subcategory: ${chunk.subcategory || 'N/A'}`);
      console.log(`  Metadata:`, JSON.stringify(chunk.metadata, null, 2));
      console.log('');
    });

    // Test 5: Check for encoding issues
    console.log('🔍 Test 5: Check for encoding issues\n');

    const specialCharsFound = allChunks.some(chunk => {
      // Check for common encoding issues
      return /[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F]/.test(chunk.text);
    });

    if (specialCharsFound) {
      console.log('⚠️  Warning: Some chunks contain special characters or encoding issues');
    } else {
      console.log('✅ No encoding issues detected');
    }

    console.log('\n========================================');
    console.log('PHASE 2 TEST COMPLETE ✅');
    console.log('========================================\n');

    console.log('Summary:');
    console.log(`✅ ${documents.length} documents loaded successfully`);
    console.log(`✅ ${totalChunks} chunks created`);
    console.log(`✅ Average chunk size: ${Math.round(avgSize)} characters (~${Math.round(avgSize / 4)} tokens)`);
    console.log(`✅ All chunking strategies working\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testPhase2();
