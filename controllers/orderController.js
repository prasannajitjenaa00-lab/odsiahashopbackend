import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Order, Product } from '../models/index.js'

let razorpay = null
const initRazorpay = () => {
  if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

// @desc  Create order
// @route POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body
    console.log('📦 Creating order:', { items, paymentMethod, user: req.user._id })
    
    if (!items || items.length === 0) return res.status(400).json({ message: 'No order items' })

    // Validate stock and compute price
    let itemsPrice = 0
    const orderItems = []
    for (const item of items) {
      let product
      if (mongoose.Types.ObjectId.isValid(item._id)) {
        product = await Product.findById(item._id)
      } else {
        // Fallback to searching by exact name or shortName if it is a mock frontend ID (like 'p3')
        product = await Product.findOne({
          $or: [
            { name: item.name },
            { shortName: item.name },
            { shortName: item.shortName }
          ]
        })
      }

      if (!product) return res.status(404).json({ message: `Product ${item.name || item._id} not found` })
      if (product.stock < item.qty) return res.status(400).json({ message: `${product.name} is out of stock` })

      itemsPrice += product.price * item.qty
      orderItems.push({ product: product._id, name: product.name, price: product.price, qty: item.qty, weight: product.weight })
    }

    const shippingPrice = itemsPrice >= 499 ? 0 : 49
    const totalPrice = itemsPrice + shippingPrice

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    })

    // If Razorpay, create payment order
    if (paymentMethod === 'razorpay') {
      const rzp = initRazorpay()
      if (!rzp) {
        // Rollback created order since payment gateway is not configured
        await Order.findByIdAndDelete(order._id)
        return res.status(400).json({ message: 'Razorpay not configured' })
      }
      
      try {
        const rzpOrder = await rzp.orders.create({
          amount: totalPrice * 100, // paise
          currency: 'INR',
          receipt: order._id.toString(),
        })
        
        // Deduct stock using the real DB ObjectId of the products
        for (const item of orderItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
        }
        
        console.log('✅ Razorpay order created:', order._id)
        return res.status(201).json({ order, razorpayOrderId: rzpOrder.id, key: process.env.RAZORPAY_KEY_ID })
      } catch (rzpErr) {
        // Rollback created order on Razorpay error
        await Order.findByIdAndDelete(order._id)
        console.error('❌ Razorpay order creation failed:', rzpErr)
        return res.status(500).json({ message: 'Failed to initialize Razorpay payment. Please try again.' })
      }
    }

    // Deduct stock for COD (Cash on Delivery)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } })
    }

    console.log('✅ COD Order created:', order._id)
    res.status(201).json({ order })
  } catch (err) {
    console.error('❌ Order creation error:', err.message, err.stack)
    res.status(500).json({ message: err.message })
  }
}

// @desc  Verify Razorpay payment
// @route POST /api/orders/:id/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')

    if (expectedSig !== razorpay_signature) return res.status(400).json({ message: 'Invalid payment signature' })

    const order = await Order.findByIdAndUpdate(req.params.id, {
      isPaid: true, paidAt: Date.now(), status: 'Processing',
      paymentResult: { razorpay_order_id, razorpay_payment_id, razorpay_signature, status: 'paid' }
    }, { new: true })

    res.json({ message: 'Payment verified', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get my orders
// @route GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get single order
// @route GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get all orders (Admin)
// @route GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const query = status ? { status } : {}
    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json({ orders, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Update order status (Admin)
// @route PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, courierName, trackingId } = req.body
    const updateData = { status }
    if (courierName !== undefined) updateData.courierName = courierName
    if (trackingId !== undefined) updateData.trackingId = trackingId
    
    if (status === 'Delivered') {
      updateData.isDelivered = true
      updateData.deliveredAt = Date.now()
    }
    
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Admin analytics
// @route GET /api/orders/analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: 'Pending' })
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' })

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      pendingOrders,
      deliveredOrders,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
