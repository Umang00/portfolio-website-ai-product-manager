# MongoDB Atlas Vector Search Index Setup Guide

## Problem

The query endpoint is detecting categories correctly but returning "No relevant context found" because the **vector search index doesn't exist** in MongoDB Atlas.

**Symptoms:**
- ✅ Categories detected: `resume_experience, linkedin_experience`
- ✅ Query embedding generated
- ❌ No relevant context found
- ❌ Empty sources array

**Root Cause:** The `vector_index` required for `$vectorSearch` operations doesn't exist in MongoDB Atlas Search & Vector Search section.

---

## Solution: Create Vector Search Index

### Step 1: Navigate to Search & Vector Search

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster: **portfolio-cluster**
3. Click on **"Search"** tab (or **"Search & Vector Search"** in the left sidebar)
4. You should see: "Create Search Index" button

### Step 2: Create Vector Search Index

1. Click **"+ Create Vector Search Index"** or **"Create Search Index"**
2. Choose **"JSON Editor"** (not the visual editor)
3. Configure the index:

**Index Name:** `vector_index`  
**Database:** `portfolio_ai` (or your `MONGODB_DB_NAME`)  
**Collection:** `memoryIndex`

**Index Definition (JSON):**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

**Important:** For Vector Search indexes, use this simpler format. The `fields` property must be an **array** (not an object), and each field uses:
- `type: "vector"` (not "knnVector")
- `path` (field name in your documents)
- `numDimensions` (not "dimensions")

4. Click **"Create Search Index"**
5. Wait for index to build (~2-5 minutes)

### Step 3: Verify Index Creation

1. Go back to **Search & Vector Search** section
2. You should see `vector_index` listed
3. Status should show **"Active"** (green checkmark)

---

## Understanding the Difference

### Regular Indexes (Data Explorer)
- **Location:** Data Explorer → Indexes tab
- **Type:** `REGULAR` (like `_id_`)
- **Purpose:** Fast lookups, sorting, uniqueness
- **Example:** `_id_` index for primary key

### Vector Search Indexes (Search & Vector Search)
- **Location:** Search & Vector Search section
- **Type:** `knnVector` (for semantic search)
- **Purpose:** Similarity search using embeddings
- **Required for:** `$vectorSearch` aggregation stage

**You need BOTH:**
- Regular indexes (auto-created) ✅
- Vector Search index (must create manually) ❌ **MISSING**

---

## About Name Matching (Your Concern #1)

### How Vector Search Works

Vector search uses **semantic similarity**, not exact text matching:

1. **Query:** "What did Umang work on at Hunch?"
   - Converted to embedding vector (1536 dimensions)
   - Represents semantic meaning, not exact words

2. **Chunks:** Your documents are chunked and embedded
   - Even if chunk says "I did this" (first person)
   - Embedding captures the semantic meaning
   - "Umang worked" and "I worked" have similar embeddings

3. **Matching:**
   - Compares query embedding with chunk embeddings
   - Uses cosine similarity
   - Finds semantically similar content, not exact text matches

### Why This Works for Your Use Case

**Journey Documents (First Person):**
- Chunk: "I worked on building an AI product..."
- Query: "What did Umang work on?"
- ✅ **Will match** - embeddings capture "work" + "AI product" semantics

**Resume/LinkedIn (Third Person):**
- Chunk: "Umang Thakkar worked at Hunch..."
- Query: "Where did he work?"
- ✅ **Will match** - embeddings understand "work" + "Hunch" relationship

**Spelling Variations:**
- Query: "What did Unang work on?" (typo)
- ✅ **Will match** - embeddings are robust to minor spelling differences
- The embedding for "Unang" is close to "Umang" in vector space

**Pronouns:**
- Query: "Where did he work?"
- ✅ **Will match** - if conversation history mentions "Umang" or context provides it
- Embeddings understand relationships and context

### Limitations

- **Very different names:** "John" vs "Umang" won't match
- **No context:** Query "where did he work?" without conversation history might not work
- **Completely unrelated:** Query about "cooking recipes" won't match work experience

---

## Testing After Index Creation

### Step 1: Verify Index is Active

1. Go to **Search & Vector Search** → Your index
2. Status should be **"Active"** (not "Building" or "Failed")

### Step 2: Test Query via Swagger UI

1. Go to `/api-test` page
2. Select **"Query AI (Chat)"** endpoint
3. Request Body:
   ```json
   {
     "query": "What did Umang work on at Hunch?",
     "conversationHistory": []
   }
   ```
4. Click **"Send Request"**

**Expected Response:**
```json
{
  "answer": "At Hunch, I worked on...",
  "sources": ["LinkedIn.pdf", "journey_fy-2023-2024.pdf"],
  "suggestedQuestions": [
    "What were the key achievements?",
    "What technologies did you use?",
    "..."
  ]
}
```

### Step 3: Test Different Query Types

**Test 1: First Person Reference**
```json
{
  "query": "What projects did you work on?",
  "conversationHistory": []
}
```

**Test 2: Third Person Reference**
```json
{
  "query": "Where did Umang work?",
  "conversationHistory": []
}
```

**Test 3: With Conversation Context**
```json
{
  "query": "What was his biggest achievement there?",
  "conversationHistory": ["User: Where did Umang work?", "AI: At Hunch..."]
}
```

---

## Troubleshooting

### Issue: Index Creation Fails

**Error:** "Invalid index definition"
- **Solution:** Check JSON syntax, ensure dimensions = 1536, similarity = "cosine"

**Error:** "Collection not found"
- **Solution:** Ensure collection `memoryIndex` exists (it should, if you've run create-index)

### Issue: Index Created But Still No Results

1. **Check Index Status:**
   - Must be **"Active"** (not "Building")
   - Wait 2-5 minutes after creation

2. **Verify Collection Has Data:**
   - Go to Data Explorer → `memoryIndex` collection
   - Should see documents with `embedding` field
   - Check if embeddings are arrays of 1536 numbers

3. **Check Index Name:**
   - Must be exactly: `vector_index`
   - Case-sensitive

4. **Verify Embedding Field:**
   - Documents should have `embedding` field
   - Should be array of 1536 numbers
   - Field path in index: `embedding`

### Issue: Wrong Index Type

**Symptom:** Index exists but `$vectorSearch` fails
- **Solution:** Ensure it's a **Vector Search Index** (knnVector type), not a regular Search Index

---

## Quick Verification Checklist

- [ ] Vector Search Index `vector_index` exists in Search & Vector Search section
- [ ] Index status is **"Active"** (green checkmark)
- [ ] Index is on collection: `memoryIndex`
- [ ] Index has `embedding` field with `knnVector` type, 1536 dimensions
- [ ] Collection `memoryIndex` has documents with `embedding` arrays
- [ ] Index name matches code: `vector_index` (exact match, case-sensitive)

---

## Next Steps After Index Creation

1. **Test Query:** Use Swagger UI to test query endpoint
2. **Verify Results:** Should return sources and suggested questions
3. **Test Edge Cases:** Try queries with pronouns, typos, different phrasings
4. **Monitor Performance:** Check query latency and result quality

---

**Status:** ⚠️ **ACTION REQUIRED** - Create vector search index in MongoDB Atlas

