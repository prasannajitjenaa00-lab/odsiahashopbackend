import jwt from 'jsonwebtoken'
import axios from 'axios'
import { User } from '../models/index.js'
import { generateOTP } from '../utils/otp.js'
import { sendOTPEmail } from '../utils/emailService.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

// @desc  Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be minimum 6 characters' })

    const exists = await User.findOne({ email })
    if (exists) {
      // If user exists but is not verified, allow them to re-register/receive new OTP
      if (!exists.isVerified) {
        exists.name = name
        exists.password = password // Pre-save hook hashes this
        const otp = generateOTP()
        exists.otp = otp
        exists.otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
        await exists.save()
        await sendOTPEmail(email, otp, name, 'verification')
        return res.status(200).json({
          message: 'Account previously registered but not verified. A new OTP has been sent.',
          email
        })
      }
      return res.status(400).json({ message: 'Email already registered' })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    await User.create({
      name,
      email,
      password,
      otp,
      otpExpiry,
      isVerified: false
    })

    await sendOTPEmail(email, otp, name, 'verification')

    res.status(201).json({
      message: 'OTP sent to your email. Please verify.',
      email
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Verify Registration OTP
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email is not registered' })

    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' })

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP code' })

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired' })

    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    const token = signToken(user._id)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      message: 'Email verified successfully!'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Resend registration OTP
// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email is not registered' })

    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' })

    // Rate Limiting: must wait at least 60 seconds
    if (user.otpExpiry) {
      const timeRemaining = user.otpExpiry.getTime() - Date.now()
      const timeElapsed = 5 * 60 * 1000 - timeRemaining
      if (timeElapsed < 60 * 1000) {
        return res.status(429).json({ message: 'Please wait 60 seconds before requesting another OTP.' })
      }
    }

    const otp = generateOTP()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    await user.save()

    await sendOTPEmail(email, otp, user.name, 'verification')

    res.json({ message: 'OTP resent to your email.' })
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
    if (!user)
      return res.status(400).json({ message: 'Email is not registered' })

    if (!(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    if (user.isBlocked)
      return res.status(403).json({ message: 'Your account has been blocked by the admin' })

    if (user.role !== 'admin' && !user.isVerified)
      return res.status(400).json({ message: 'Please verify your email first' })

    const token = signToken(user._id)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Forgot Password
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email is not registered' })

    const resetOtp = generateOTP()
    user.resetOtp = resetOtp
    user.resetOtpExpiry = new Date(Date.now() + 5 * 60 * 1000)
    await user.save()

    await sendOTPEmail(email, resetOtp, user.name, 'reset')

    res.json({ message: 'OTP sent to your email for password reset.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Verify Reset OTP
// @route POST /api/auth/verify-reset-otp
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email is not registered' })

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid OTP code' })

    if (new Date() > user.resetOtpExpiry)
      return res.status(400).json({ message: 'OTP has expired' })

    res.json({ message: 'OTP verified successfully. You can now reset your password.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Reset Password
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body
    if (!email || !otp || !password)
      return res.status(400).json({ message: 'Email, OTP, and new password are required' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be minimum 6 characters' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email is not registered' })

    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({ message: 'Invalid or expired OTP' })

    if (new Date() > user.resetOtpExpiry)
      return res.status(400).json({ message: 'OTP has expired' })

    user.password = password
    user.resetOtp = undefined
    user.resetOtpExpiry = undefined
    await user.save()

    res.json({ message: 'Password has been reset successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Google Login
// @route POST /api/auth/google-login
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Google ID token required' })

    let payload
    try {
      const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
      payload = googleRes.data
    } catch (err) {
      console.error('Google token verification failed:', err.message)
      return res.status(400).json({ message: 'Invalid Google token' })
    }

    const { sub: googleId, email, name } = payload
    if (!email) return res.status(400).json({ message: 'Email not provided by Google' })

    let user = await User.findOne({ email })

    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked by the admin' })
      }

      let changed = false
      if (!user.googleId) {
        user.googleId = googleId
        changed = true
      }
      if (!user.isVerified) {
        user.isVerified = true
        changed = true
      }
      if (changed) {
        await user.save()
      }
    } else {
      // Create new Google verified user
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true
      })
    }

    const jwtToken = signToken(user._id)
    res.json({
      token: jwtToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Logout
// @route POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' })
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
