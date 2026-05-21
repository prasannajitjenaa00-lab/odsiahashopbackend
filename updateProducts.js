import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Product } from './models/index.js'

dotenv.config()

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    const products = await Product.find({})
    console.log(`Found ${products.length} products to process.`)
    
    for (let p of products) {
      let updated = false
      if (!p.name.toLowerCase().startsWith('desi')) {
        p.name = 'Desi ' + p.name
        updated = true
      }
      if (p.shortName && !p.shortName.toLowerCase().startsWith('desi')) {
        p.shortName = 'Desi ' + p.shortName
        updated = true
      }
      if (updated) {
        await p.save()
        console.log(`👉 Updated name to: "${p.name}"`)
      } else {
        console.log(`✅ Already prefixed: "${p.name}"`)
      }
    }
    
    console.log('🎉 Successfully ensured all products have "Desi" prefix in the database!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  }
}

run()
