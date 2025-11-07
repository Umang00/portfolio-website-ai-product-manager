// lib/ai/file-watcher.ts
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { getDBAI } from '../db/mongodb'
import { listPDFs } from './loaders/pdf-loader'

const FILE_METADATA_COLLECTION = 'file_metadata'

export interface FileMetadata {
  filename: string
  hash: string
  lastProcessed: Date
  chunkCount: number
  fileSize: number
  sourceType: 'pdf' | 'github'
  // For GitHub repos, we'll use updatedAt from API instead of hash
  updatedAt?: string
}

/**
 * Compute SHA-256 hash of a file
 * @param filePath Absolute path to the file
 * @returns Hex digest of the file hash
 */
export async function getFileHash(filePath: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath)
    const hash = crypto.createHash('sha256')
    hash.update(fileBuffer)
    return hash.digest('hex')
  } catch (error) {
    console.error(`Error computing hash for ${filePath}:`, error)
    throw error
  }
}

/**
 * Get file size in bytes
 * @param filePath Absolute path to the file
 * @returns File size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error)
    return 0
  }
}

/**
 * Get stored metadata for a file
 * @param filename Name of the file
 * @param sourceType Type of source ('pdf' or 'github')
 * @returns File metadata or null if not found
 */
export async function getFileMetadata(
  filename: string,
  sourceType: 'pdf' | 'github' = 'pdf'
): Promise<FileMetadata | null> {
  try {
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)

    const metadata = await collection.findOne({
      filename,
      sourceType,
    })

    return metadata
  } catch (error) {
    console.error(`Error getting file metadata for ${filename}:`, error)
    return null
  }
}

/**
 * Update or create file metadata in MongoDB
 * @param filename Name of the file
 * @param hash SHA-256 hash of the file
 * @param chunkCount Number of chunks created from this file
 * @param fileSize Size of the file in bytes
 * @param sourceType Type of source ('pdf' or 'github')
 * @param updatedAt Optional updatedAt timestamp for GitHub repos
 */
export async function updateFileMetadata(
  filename: string,
  hash: string,
  chunkCount: number,
  fileSize: number,
  sourceType: 'pdf' | 'github' = 'pdf',
  updatedAt?: string
): Promise<void> {
  try {
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)

    const metadata: FileMetadata = {
      filename,
      hash,
      lastProcessed: new Date(),
      chunkCount,
      fileSize,
      sourceType,
      ...(updatedAt && { updatedAt }),
    }

    await collection.updateOne(
      { filename, sourceType },
      { $set: metadata },
      { upsert: true }
    )

    console.log(`✅ Updated metadata for ${filename} (${sourceType})`)
  } catch (error) {
    console.error(`Error updating file metadata for ${filename}:`, error)
    throw error
  }
}

/**
 * Check for changed PDF files by comparing current hashes with stored hashes
 * @returns Array of filenames that have changed or are new
 */
export async function checkForPDFChanges(): Promise<string[]> {
  try {
    const changedFiles: string[] = []
    const pdfFilenames = listPDFs()
    const documentsPath = path.join(process.cwd(), 'documents')

    console.log(`🔍 Checking ${pdfFilenames.length} PDF files for changes...`)

    for (const filename of pdfFilenames) {
      const filePath = path.join(documentsPath, filename)

      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File ${filename} not found, skipping`)
        continue
      }

      // Compute current hash
      const currentHash = await getFileHash(filePath)
      const currentSize = getFileSize(filePath)

      // Get stored metadata
      const storedMetadata = await getFileMetadata(filename, 'pdf')

      if (!storedMetadata) {
        // New file
        console.log(`📄 New file detected: ${filename}`)
        changedFiles.push(filename)
      } else if (storedMetadata.hash !== currentHash) {
        // File changed
        console.log(`📝 File changed: ${filename} (hash: ${storedMetadata.hash.substring(0, 8)}... → ${currentHash.substring(0, 8)}...)`)
        changedFiles.push(filename)
      } else if (storedMetadata.fileSize !== currentSize) {
        // Size changed but hash didn't (shouldn't happen, but check anyway)
        console.log(`⚠️  File size changed but hash didn't: ${filename}`)
        changedFiles.push(filename)
      } else {
        // File unchanged
        console.log(`✓ File unchanged: ${filename}`)
      }
    }

    // Check for deleted files (files in metadata but not on disk)
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)
    const allStoredPDFs = await collection
      .find({ sourceType: 'pdf' })
      .toArray()

    for (const stored of allStoredPDFs) {
      if (!pdfFilenames.includes(stored.filename)) {
        console.log(`🗑️  File deleted: ${stored.filename}`)
        // Note: We don't add deleted files to changedFiles array
        // The caller should handle deletion separately if needed
      }
    }

    console.log(`✅ Change detection complete: ${changedFiles.length} file(s) changed`)
    return changedFiles
  } catch (error) {
    console.error('Error checking for PDF changes:', error)
    throw error
  }
}

/**
 * Check for changed GitHub repositories by comparing updatedAt timestamps
 * @param currentRepos Array of current GitHub repos with updatedAt timestamps
 * @returns Array of repo names that have changed or are new
 */
export async function checkForGitHubChanges(
  currentRepos: Array<{ name: string; updatedAt: string }>
): Promise<string[]> {
  try {
    const changedRepos: string[] = []
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)

    console.log(`🔍 Checking ${currentRepos.length} GitHub repositories for changes...`)

    for (const repo of currentRepos) {
      const storedMetadata = await getFileMetadata(repo.name, 'github')

      if (!storedMetadata) {
        // New repo
        console.log(`📄 New repository detected: ${repo.name}`)
        changedRepos.push(repo.name)
      } else if (storedMetadata.updatedAt !== repo.updatedAt) {
        // Repo updated
        console.log(`📝 Repository updated: ${repo.name} (${storedMetadata.updatedAt} → ${repo.updatedAt})`)
        changedRepos.push(repo.name)
      } else {
        // Repo unchanged
        console.log(`✓ Repository unchanged: ${repo.name}`)
      }
    }

    console.log(`✅ GitHub change detection complete: ${changedRepos.length} repo(s) changed`)
    return changedRepos
  } catch (error) {
    console.error('Error checking for GitHub changes:', error)
    throw error
  }
}

/**
 * Check for changes across all sources (PDFs and GitHub)
 * @param currentGitHubRepos Optional array of current GitHub repos
 * @returns Object with changed PDFs and GitHub repos
 */
export async function checkForChanges(
  currentGitHubRepos?: Array<{ name: string; updatedAt: string }>
): Promise<{
  changedPDFs: string[]
  changedGitHubRepos: string[]
}> {
  const changedPDFs = await checkForPDFChanges()
  const changedGitHubRepos = currentGitHubRepos
    ? await checkForGitHubChanges(currentGitHubRepos)
    : []

  return {
    changedPDFs,
    changedGitHubRepos,
  }
}

/**
 * Delete metadata for a file (useful when file is deleted)
 * @param filename Name of the file
 * @param sourceType Type of source ('pdf' or 'github')
 */
export async function deleteFileMetadata(
  filename: string,
  sourceType: 'pdf' | 'github' = 'pdf'
): Promise<void> {
  try {
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)

    await collection.deleteOne({ filename, sourceType })
    console.log(`🗑️  Deleted metadata for ${filename} (${sourceType})`)
  } catch (error) {
    console.error(`Error deleting file metadata for ${filename}:`, error)
    throw error
  }
}

/**
 * Get all file metadata (useful for debugging or stats)
 * @returns Array of all file metadata
 */
export async function getAllFileMetadata(): Promise<FileMetadata[]> {
  try {
    const db = await getDBAI()
    const collection = db.collection<FileMetadata>(FILE_METADATA_COLLECTION)

    return await collection.find({}).toArray()
  } catch (error) {
    console.error('Error getting all file metadata:', error)
    throw error
  }
}

