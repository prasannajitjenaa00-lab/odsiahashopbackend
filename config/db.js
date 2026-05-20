import mongoose from 'mongoose'
import dns from 'dns'

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env')
    }

    if (process.env.MONGO_URI.startsWith('mongodb+srv://')) {
      dns.setServers(['8.8.8.8', '8.8.4.4'])
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`)
    process.exit(1)
  }
}

export default connectDB
