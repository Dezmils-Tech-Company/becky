#!/usr/bin/env tsx

import { adminAuth } from '../src/lib/firebase/admin'
import { connectDB } from '../src/lib/mongodb/client'
import { User } from '../src/models'

async function main() {
  const uid = process.argv[2]
  if (!uid) {
    console.error('Usage: tsx scripts/set-admin-claim.ts <firebase-uid>')
    process.exit(1)
  }

  try {
    // Set custom claim in Firebase Auth
    await adminAuth.setCustomUserClaims(uid, { admin: true })
    console.log(`Set custom claim 'admin' to true for UID: ${uid}`)

    // Connect to MongoDB
    await connectDB()

    // Update user role in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: { role: 'admin' } },
      { new: true }
    )

    if (!updatedUser) {
      console.error(`User with UID ${uid} not found in MongoDB`)
      process.exit(1)
    }

    console.log(`Updated user role to 'admin' for UID: ${uid}`)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()