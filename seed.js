import mongoose from 'mongoose'
import dns from 'dns'
import dotenv from 'dotenv'
import { Product, User, Category } from './models/index.js'

dotenv.config()

if (process.env.MONGO_URI?.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '8.8.4.4'])
}

const products = [
  { name: 'Gota Biri (Urad Dal)', shortName: 'Gota Biri', description: 'Premium whole urad dal sourced directly from Odisha farms. Rich in protein and fiber, perfect for dal makhani, idli batter and more.', price: 150, weight: '1kg', category: 'Dal', stock: 50, badge: 'Bestseller', isFeatured: true, rating: 4.9, numReviews: 320, color: '#1a1a1a', accent: '#888', image: '/gota-biri.png' },
  { name: 'Red Rice (Kumara Chaula)', shortName: 'Red Rice', description: 'Traditional Odia red rice packed with antioxidants and minerals. Nutty flavor with a chewy texture, ideal for everyday cooking.', price: 120, weight: '1kg', category: 'Rice', stock: 80, isFeatured: true, rating: 4.8, numReviews: 215, color: '#3a0808', accent: '#8B2014', image: '/red-rice.png' },
  { name: 'Moong Dal (Split)', shortName: 'Moong Dal', description: 'Light and easily digestible split moong dal from Odisha. Perfect for khichdi, soups, and a variety of healthy dishes.', price: 110, weight: '1kg', category: 'Dal', stock: 65, isFeatured: true, rating: 4.7, numReviews: 198, color: '#1a1800', accent: '#C4A200', image: '/moong-dal.png' },
  { name: 'Toor Dal', shortName: 'Toor Dal', description: 'Authentic Odia toor dal with rich earthy flavor. A kitchen staple for dal tadka, sambar and traditional Odia thali.', price: 130, weight: '1kg', category: 'Dal', stock: 70, isFeatured: true, rating: 4.8, numReviews: 175, color: '#1a0d00', accent: '#D4830A', image: '/toor-dal.png' },
  { name: 'Kolatha (Horse Gram)', shortName: 'Kolatha', description: 'Nutritious horse gram traditionally grown in Odisha. High in protein, iron and antioxidants — a true superfood dal.', price: 90, weight: '1kg', category: 'Dal', stock: 45, badge: 'Organic', rating: 4.6, numReviews: 142, color: '#1a0d08', accent: '#8B4513', image: '/kolatha.png' },
  { name: 'Chana Dal', shortName: 'Chana Dal', description: 'Freshly milled split bengal gram with vibrant yellow color. Adds richness to curries, halwa and snacks.', price: 115, weight: '1kg', category: 'Dal', stock: 55, rating: 4.7, numReviews: 160, color: '#1a1400', accent: '#D4A800', image: '/chana-dal.png' },
  { name: 'Sona Masoori Rice', shortName: 'Sona Masoori', description: 'Premium Sona Masoori rice — lightweight, low starch, and aromatic. Perfect for everyday meals and biryani.', price: 100, weight: '1kg', category: 'Rice', stock: 90, rating: 4.8, numReviews: 210, color: '#0d0d0d', accent: '#C8C8A0', image: '/sona-masoori.png' },
  { name: 'Masur Dal (Red Lentil)', shortName: 'Masur Dal', description: 'Tender red lentils that cook quickly. Rich in iron and folate, perfect for soups, dals and curries.', price: 105, weight: '1kg', category: 'Dal', stock: 60, badge: 'New', rating: 4.6, numReviews: 88, color: '#1a0600', accent: '#C04020', image: '/got-dal.png' }, // Adjusted slightly
]

const categories = [
  { categoryName: 'Dal', categoryImage: '/gota-biri.png' },
  { categoryName: 'Rice', categoryImage: '/red-rice.png' },
]

const adminUser = {
  name: 'Admin',
  email: 'admin@odisha.shop',
  password: 'admin123456',
  role: 'admin',
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    console.log('✅ Connected to MongoDB')

    await Product.deleteMany({})
    await User.deleteMany({ email: adminUser.email })
    await Category.deleteMany({})

    await Product.insertMany(products)
    await User.create(adminUser)
    await Category.insertMany(categories)

    console.log('✅ Database seeded successfully!')
    console.log(`   ${products.length} products inserted`)
    console.log(`   ${categories.length} categories inserted`)
    console.log(`   Admin: admin@odisha.shop / admin123456`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()
