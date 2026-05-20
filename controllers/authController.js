import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

// @desc  Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    if (user.isBlocked)
      return res.status(403).json({ message: 'Your account has been blocked by the admin' })

    const token = signToken(user._id)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get current user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.json(user)
}

// @desc  Update profile
// @route PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    if (req.body.address) user.address = { ...user.address, ...req.body.address }
    if (req.body.password) user.password = req.body.password

    const updated = await user.save()
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
