import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: function() { return !this.googleId; }, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  phone: { type: String },
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  if (!this.password) return next() // Skip hashing if no password (Google OAuth user)
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false // Google users without password can't match normal passwords
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
  originalPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
  discountedPrice: { type: Number },
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

// ── Address ───────────────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  locality: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true }, // Area and Street
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  addressType: { type: String, enum: ['home', 'work'], default: 'home' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true })

export const Address = mongoose.model('Address', addressSchema)

// ── Blog ──────────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  author: { type: String, default: 'OdishaShop' },
  publishDate: { type: Date, default: Date.now },
  metaTitle: { type: String, trim: true },
  metaDescription: { type: String, trim: true }
}, { timestamps: true })

export const Blog = mongoose.model('Blog', blogSchema)

// ── Contact Inquiry ───────────────────────────────────────────────────────────
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Read', 'Replied'] }
}, { timestamps: true })

export const Inquiry = mongoose.model('Inquiry', inquirySchema)
