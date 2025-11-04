// app/api/test-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { testConnection } from '@/lib/db/mongodb'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing MongoDB connection...')
    const connected = await testConnection()

    if (connected) {
      return NextResponse.json({
        success: true,
        message: '✅ MongoDB connection successful!',
        database: process.env.MONGODB_DB_NAME,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to MongoDB',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('MongoDB connection test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
