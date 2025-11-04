// lib/db/mongodb.ts
import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local')
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

const options = {}

// Declare global augmentation for cached connection
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

/**
 * Get the primary MongoDB database instance
 * Uses cached connection in serverless environments
 */
export async function getDB(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

/**
 * Get the AI-specific MongoDB database instance
 * Currently points to the same database, but can be configured differently
 */
export async function getDBAI(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error('Error connecting to AI MongoDB:', error)
    throw error
  }
}

/**
 * Get the MongoDB client for administrative operations
 */
export async function getClient(): Promise<MongoClient> {
  return clientPromise
}

/**
 * Test the MongoDB connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await clientPromise
    await client.db(dbName).command({ ping: 1 })
    console.log('✅ Successfully connected to MongoDB')
    return true
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    return false
  }
}

export default clientPromise
