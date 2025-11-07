// test-file-metadata.js
// Helper script to check file metadata in MongoDB

// This would require direct MongoDB access, but we can test via the API
// by checking if change detection works correctly

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000'

async function checkMetadata() {
  console.log('📊 Checking File Metadata Status\n')
  console.log('📍 Testing against:', BASE_URL, '\n')

  // Test 1: Run a no-change check
  console.log('Test: Running change detection check...\n')
  
  const response = await fetch(`${BASE_URL}/api/ai/create-index`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRebuild: false }),
  })

  const data = await response.json()

  if (data.success && data.skipped) {
    console.log('✅ Change detection is working!')
    console.log('   - No changes detected (as expected)')
    console.log('   - Metadata appears to be stored correctly\n')
    console.log('💡 To test file change detection:')
    console.log('   1. Modify any PDF file in the documents folder')
    console.log('   2. Run: node test-phase3-change-detection.js')
    console.log('   3. The changed file should be reprocessed\n')
  } else if (data.success && !data.skipped) {
    console.log('⚠️  Changes detected or metadata not found')
    console.log(`   - Chunks created: ${data.chunksCreated}`)
    console.log(`   - Documents processed: ${data.documentsProcessed}`)
    if (data.filesUpdated) {
      console.log(`   - Files updated: ${data.filesUpdated.join(', ')}`)
    }
  } else {
    console.log('❌ Error checking metadata')
    console.log(`   Error: ${data.error || 'Unknown error'}`)
  }
}

checkMetadata().catch(console.error)

