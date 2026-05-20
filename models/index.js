import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  phone: { type: String },
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  createdAt: { type: Date, default: Date.now },
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

export const User = mongoose.model('User', userSchema)

// ── Product ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  shortName: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  weight: { type: String, default: '1kg' },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  badge: { type: String },
  image: { type: String },
  color: { type: String, default: '#1a1200' },
  accent: { type: String, default: '#C8A951' },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true })

// Recalculate rating on save
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return }
  this.numReviews = this.reviews.length
  this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length
}

export const Product = mongoose.model('Product', productSchema)

// ── Category ──────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true, trim: true },
  categoryImage: { type: String, required: true },
}, { timestamps: true })

export const Category = mongoose.model('Category', categorySchema)

// ── Order ─────────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  qty: Number,
  weight: String,
})

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: String,
  },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, default: 'Pending' },
  courierName: { type: String, default: '' },
  trackingId: { type: String, default: '' },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
}, { timestamps: true })

export const Order = mongoose.model('Order', orderSchema)
