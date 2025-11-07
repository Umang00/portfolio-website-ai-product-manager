# Testing Change Detection via Swagger UI

**Location:** `/api-test` page (Swagger-like API testing interface)

## How to Test Change Detection

### Step 1: Access the API Testing Interface

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5000/api-test`

3. (Optional) Authenticate with your `ADMIN_SECRET` if you want to test admin endpoints

---

### Step 2: Test Initial Build (Force Rebuild)

**Purpose:** Create initial index and populate file metadata

1. **Select Endpoint:** "Create Index (Change Detection)"
2. **Method:** POST
3. **Request Body:** 
   ```json
   {
     "forceRebuild": true
   }
   ```
4. **Click:** "Send Request"

**Expected Response:**
```json
{
  "success": true,
  "message": "Memory index built successfully",
  "chunksCreated": 254,
  "documentsProcessed": 20,
  "skipped": false
}
```

**What Happens:**
- Processes all PDFs and GitHub repos
- Creates embeddings for all documents
- Stores file metadata (hashes) in MongoDB
- Takes ~30-60 seconds depending on file count

---

### Step 3: Test Change Detection (No Changes)

**Purpose:** Verify that change detection skips rebuild when no files changed

1. **Select Endpoint:** "Create Index (Change Detection)" (same endpoint)
2. **Method:** POST
3. **Request Body:**
   ```json
   {
     "forceRebuild": false
   }
   ```
4. **Click:** "Send Request"

**Expected Response:**
```json
{
  "success": true,
  "message": "No changes detected, skipped rebuild",
  "chunksCreated": 0,
  "documentsProcessed": 0,
  "skipped": true
}
```

**What Happens:**
- Checks file hashes against stored metadata
- Detects no changes
- Skips rebuild (no API calls to OpenAI)
- Returns immediately (~1-2 seconds)

---

### Step 4: Test Change Detection (With Changes)

**Purpose:** Verify that only changed files are reprocessed

**Prerequisites:** Modify a PDF file in the `documents` folder

1. **Modify a File:**
   - Open any PDF in `/documents` folder
   - Add or modify content
   - Save the file

2. **Test Change Detection:**
   - **Select Endpoint:** "Create Index (Change Detection)"
   - **Method:** POST
   - **Request Body:**
     ```json
     {
       "forceRebuild": false
     }
     ```
   - **Click:** "Send Request"

**Expected Response:**
```json
{
  "success": true,
  "message": "Memory index built successfully",
  "chunksCreated": 45,
  "documentsProcessed": 1,
  "skipped": false,
  "filesUpdated": ["Umang_Thakkar_PM_Master_Resume.pdf"]
}
```

**What Happens:**
- Detects changed file by comparing hash
- Deletes old embeddings for that file
- Processes only the changed file
- Generates embeddings only for new chunks
- Updates metadata for the changed file
- Other files remain untouched

---

## Understanding the Response Fields

### Success Response Fields:

- **`success`** (boolean): Whether the operation succeeded
- **`message`** (string): Human-readable status message
- **`chunksCreated`** (number): Number of chunks created (0 if skipped)
- **`documentsProcessed`** (number): Number of documents processed (0 if skipped)
- **`skipped`** (boolean): Whether rebuild was skipped due to no changes
- **`filesUpdated`** (array, optional): List of filenames that were updated (only present in incremental updates)

### Example Responses:

**Full Rebuild:**
```json
{
  "success": true,
  "message": "Memory index built successfully",
  "chunksCreated": 254,
  "documentsProcessed": 20,
  "skipped": false
}
```

**No Changes (Skipped):**
```json
{
  "success": true,
  "message": "No changes detected, skipped rebuild",
  "chunksCreated": 0,
  "documentsProcessed": 0,
  "skipped": true
}
```

**Incremental Update:**
```json
{
  "success": true,
  "message": "Memory index built successfully",
  "chunksCreated": 45,
  "documentsProcessed": 1,
  "skipped": false,
  "filesUpdated": ["journey_fy-2025-2026.pdf"]
}
```

---

## Testing Workflow

### Complete Test Sequence:

1. **Initial Build:**
   - `forceRebuild: true` → Should process all files

2. **No-Change Test:**
   - `forceRebuild: false` → Should skip (chunksCreated: 0)

3. **Change Detection Test:**
   - Modify a PDF file
   - `forceRebuild: false` → Should process only changed file
   - Check `filesUpdated` array contains the filename

4. **Verify Cost Savings:**
   - Compare chunksCreated between full rebuild (254) and incremental (45)
   - Only changed file's chunks are regenerated

---

## Tips for Testing

1. **Use Browser DevTools:** Check the Network tab to see request/response details
2. **Check Console Logs:** Server logs show detailed change detection process
3. **Test Multiple Scenarios:**
   - No changes → Should skip
   - One file changed → Should process only that file
   - Multiple files changed → Should process all changed files
4. **Verify Metadata:** After initial build, metadata is stored. Subsequent calls with `forceRebuild: false` will use it.

---

## Troubleshooting

**Issue:** Always getting `skipped: false` even with no changes
- **Solution:** Make sure you ran initial build with `forceRebuild: true` first to populate metadata

**Issue:** `filesUpdated` array is empty
- **Solution:** This is normal for full rebuilds. `filesUpdated` only appears in incremental updates

**Issue:** Change detection not working
- **Solution:** Check MongoDB connection and verify `file_metadata` collection exists

---

## Related Endpoints

- **`/api/ai/rebuild`** - Admin-only force rebuild (always does full rebuild)
- **`/api/ai/refresh`** - Cron endpoint (uses change detection automatically)

---

**Status:** ✅ Change Detection fully testable via Swagger UI

