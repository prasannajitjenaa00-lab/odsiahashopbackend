import mongoose from 'mongoose'
import { Product, Order } from '../models/index.js'

// @desc  Get all products (with filter/search/sort)
// @route GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query
    const query = {}
    if (category && category !== 'All') query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }

    let sortObj = { createdAt: -1 }
    if (sort === 'price-asc') sortObj = { price: 1 }
    if (sort === 'price-desc') sortObj = { price: -1 }
    if (sort === 'rating') sortObj = { rating: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(Number(limit))

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get single product
// @route GET /api/products/:id
export const getProduct = async (req, res) => {
  try {
    let product
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id)
    } else {
      const mockIndex = parseInt(req.params.id.replace('p', '')) - 1
      const mockNames = [
        'Gota Biri (Urad Dal)',
        'Red Rice (Kumara Chaula)',
        'Moong Dal (Split)',
        'Toor Dal',
        'Kolatha (Horse Gram)',
        'Chana Dal',
        'Sona Masoori Rice',
        'Masur Dal (Red Lentil)'
      ]
      if (mockIndex >= 0 && mockIndex < mockNames.length) {
        product = await Product.findOne({ name: mockNames[mockIndex] })
      }
    }
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Create product (Admin)
// @route POST /api/products
export const createProduct = async (req, res) => {
  try {
    if (req.body.productName) req.body.name = req.body.productName
    if (req.body.featured !== undefined) req.body.isFeatured = req.body.featured
    if (req.body.name && !req.body.name.toLowerCase().startsWith('desi')) {
      req.body.name = 'Desi ' + req.body.name
    }
    if (req.body.shortName && !req.body.shortName.toLowerCase().startsWith('desi')) {
      req.body.shortName = 'Desi ' + req.body.shortName
    } else if (req.body.name && !req.body.shortName) {
      req.body.shortName = req.body.name.split(' ')[0]
    }
    
    // Discount Calculation
    if (req.body.originalPrice && req.body.discountPercent !== undefined) {
      const orig = Number(req.body.originalPrice);
      const dist = Number(req.body.discountPercent);
      if (orig > 0 && dist >= 0) {
        req.body.discountedPrice = Math.round(orig - (orig * dist / 100));
        req.body.price = req.body.discountedPrice;
      }
    } else if (req.body.price && !req.body.originalPrice) {
      req.body.originalPrice = req.body.price;
      req.body.discountedPrice = req.body.price;
      req.body.discountPercent = 0;
    }

    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Update product (Admin)
// @route PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (req.body.productName) req.body.name = req.body.productName
    if (req.body.featured !== undefined) req.body.isFeatured = req.body.featured
    if (req.body.name && !req.body.name.toLowerCase().startsWith('desi')) {
      req.body.name = 'Desi ' + req.body.name
    }
    if (req.body.shortName && !req.body.shortName.toLowerCase().startsWith('desi')) {
      req.body.shortName = 'Desi ' + req.body.shortName
    } else if (req.body.name && !req.body.shortName) {
      req.body.shortName = req.body.name.split(' ')[0]
    }

    // Discount Calculation
    if (req.body.originalPrice !== undefined || req.body.discountPercent !== undefined) {
      const orig = Number(req.body.originalPrice || 0);
      const dist = Number(req.body.discountPercent || 0);
      if (orig > 0 && dist >= 0) {
        req.body.discountedPrice = Math.round(orig - (orig * dist / 100));
        req.body.price = req.body.discountedPrice;
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Delete product (Admin)
// @route DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' })
    }
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Add review
// @route POST /api/products/:id/reviews
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Check if user has a delivered order for this product
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      status: 'Delivered',
      'items.product': product._id
    })

    if (!deliveredOrder) {
      return res.status(400).json({ message: 'You can only review products that have been delivered to you' })
    }

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' })

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment })
    product.updateRating()
    await product.save()
    res.status(201).json({ message: 'Review added' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get featured products
// @route GET /api/products/featured
export const getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
