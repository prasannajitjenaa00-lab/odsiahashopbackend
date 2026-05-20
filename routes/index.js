import express from 'express'
import { register, login, getMe, updateProfile } from '../controllers/authController.js'
import { protect, admin } from '../middleware/auth.js'
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeatured } from '../controllers/productController.js'
import { createOrder, verifyPayment, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getAnalytics } from '../controllers/orderController.js'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'
import { upload } from '../middleware/upload.js'
import { User } from '../models/index.js'
import { checkPincode } from '../controllers/pincodeController.js'

const router = express.Router()

// ── Utilities ─────────────────────────────────────────────────────────────────
router.post('/check-pincode', checkPincode)

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/me', protect, getMe)
router.put('/auth/profile', protect, updateProfile)

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', getProducts)
router.get('/products/featured', getFeatured)
router.get('/products/:id', getProduct)
router.post('/products', protect, admin, createProduct)
router.put('/products/:id', protect, admin, updateProduct)
router.delete('/products/:id', protect, admin, deleteProduct)
router.post('/products/:id/reviews', protect, addReview)

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', getCategories)
router.post('/categories', protect, admin, createCategory)
router.put('/categories/:id', protect, admin, updateCategory)
router.delete('/categories/:id', protect, admin, deleteCategory)

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/orders', protect, createOrder)
router.post('/orders/:id/verify-payment', protect, verifyPayment)
router.get('/orders/my', protect, getMyOrders)
router.get('/orders/analytics', protect, admin, getAnalytics)
router.get('/orders', protect, admin, getAllOrders)
router.get('/orders/:id', protect, getOrder)
router.put('/orders/:id/status', protect, admin, updateOrderStatus)

// ── Admin: Users ──────────────────────────────────────────────────────────────
router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/admin/users/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/admin/users/:id/block', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin users' })
    user.isBlocked = !user.isBlocked
    await user.save()
    res.json({ message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}`, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Admin: Image Uploads ──────────────────────────────────────────────────────
router.post('/admin/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  res.json({ imageUrl: `/uploads/${req.file.filename}` })
})

export default router
