import mongoose from 'mongoose'
import { env } from '../../config/env'

// Global connection cache to prevent multiple connections in development
let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log('🔌 Using existing MongoDB connection')
    return
  }

  try {
    await mongoose.connect(env.MONGODB_URI)

    isConnected = true
    console.log('✅ MongoDB connected successfully')

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔌 MongoDB connected')
    })

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected')
      isConnected = false
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
      isConnected = false
    })
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    throw error
  }
}

// Helper to get connection status
export function isDBConnected(): boolean {
  return isConnected
}