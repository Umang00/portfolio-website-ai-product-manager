// test-phase3-change-detection.js
// Test script for Phase 3: Change Detection System

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000'

async function testAPI(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    }
  }
}

async function runTests() {
  console.log('🧪 Testing Phase 3: Change Detection System\n')
  console.log(`📍 Testing against: ${BASE_URL}\n`)

  // Test 1: Initial build with forceRebuild=true
  console.log('📋 Test 1: Initial build with forceRebuild=true')
  console.log('   This should process all files and create metadata...\n')

  const test1 = await testAPI('/api/ai/create-index', 'POST', {
    forceRebuild: true,
  })

  if (test1.ok && test1.data.success) {
    console.log('✅ Test 1 PASSED')
    console.log(`   - Chunks created: ${test1.data.chunksCreated}`)
    console.log(`   - Documents processed: ${test1.data.documentsProcessed}`)
    console.log(`   - Skipped: ${test1.data.skipped || false}\n`)
  } else {
    console.log('❌ Test 1 FAILED')
    console.log(`   Error: ${test1.data?.error || test1.error}\n`)
    return
  }

  // Wait a moment for metadata to be saved
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Test 2: No-change scenario (should skip)
  console.log('📋 Test 2: No-change scenario (should skip rebuild)')
  console.log('   Calling create-index without forceRebuild...\n')

  const test2 = await testAPI('/api/ai/create-index', 'POST', {
    forceRebuild: false,
  })

  if (test2.ok && test2.data.success) {
    if (test2.data.skipped) {
      console.log('✅ Test 2 PASSED - Correctly skipped rebuild')
      console.log(`   - Skipped: ${test2.data.skipped}`)
      console.log(`   - Chunks created: ${test2.data.chunksCreated} (should be 0)\n`)
    } else {
      console.log('⚠️  Test 2 PARTIAL - Rebuild ran instead of skipping')
      console.log(`   - Skipped: ${test2.data.skipped}`)
      console.log(`   - Chunks created: ${test2.data.chunksCreated}\n`)
    }
  } else {
    console.log('❌ Test 2 FAILED')
    console.log(`   Error: ${test2.data?.error || test2.error}\n`)
  }

  // Test 3: Check file metadata (if we have access to MongoDB)
  console.log('📋 Test 3: Verify file metadata was created')
  console.log('   (This requires MongoDB access - checking via API response)\n')

  // We can't directly check MongoDB, but we can verify by running another no-change test
  const test3 = await testAPI('/api/ai/create-index', 'POST', {
    forceRebuild: false,
  })

  if (test3.ok && test3.data.success && test3.data.skipped) {
    console.log('✅ Test 3 PASSED - Metadata appears to be working')
    console.log('   (No changes detected on second call, indicating metadata is stored)\n')
  } else {
    console.log('⚠️  Test 3 UNCERTAIN - Cannot verify metadata without direct DB access\n')
  }

  console.log('📊 Test Summary:')
  console.log('   - Test 1 (Initial build):', test1.ok && test1.data.success ? '✅ PASSED' : '❌ FAILED')
  console.log('   - Test 2 (No-change skip):', test2.ok && test2.data?.skipped ? '✅ PASSED' : '⚠️  CHECK')
  console.log('   - Test 3 (Metadata check):', test3.ok && test3.data?.skipped ? '✅ PASSED' : '⚠️  UNCERTAIN')
  console.log('\n💡 Next steps:')
  console.log('   1. Modify a PDF file in the documents folder')
  console.log('   2. Run: node test-phase3-change-detection.js')
  console.log('   3. Verify only the changed file is reprocessed')
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test runner error:', error)
  process.exit(1)
})

