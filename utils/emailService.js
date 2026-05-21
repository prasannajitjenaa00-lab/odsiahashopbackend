import nodemailer from 'nodemailer'

export const sendOTPEmail = async (email, otp, name, type = 'verification') => {
  const isReset = type === 'reset'
  const subject = isReset 
    ? 'Reset your password - ODISHA.SHOP' 
    : 'Verify your email address - ODISHA.SHOP'
  
  const titleText = isReset
    ? 'Password Reset Request'
    : 'Welcome to ODISHA.SHOP'
  
  const bodyText = isReset
    ? 'We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the reset:'
    : 'Thank you for choosing ODISHA.SHOP. To complete your registration, please verify your email address using the following One-Time Password (OTP):'

  // Log in console as a secure bypass/fallback
  console.log(`[EMAIL OTP LOG] Email: ${email} | Name: ${name} | OTP: ${otp} | Type: ${type}`)

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL BYPASS] Nodemailer credentials not set in .env. Skipping actual email send.`)
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"ODISHA.SHOP Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; color: #111111;">
          <h2 style="color: #C8A951; text-align: center; margin-bottom: 20px;">${titleText}</h2>
          <p style="font-size: 16px; line-height: 1.5;">Dear ${name || 'Valued Customer'},</p>
          <p style="font-size: 16px; line-height: 1.5;">${bodyText}</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px dashed #C8A951;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111111;">${otp}</span>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.5;">This OTP is valid for <strong>5 minutes</strong>. If you did not make this request, please secure your account or contact support immediately.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 10px;">ODISHA.SHOP &copy; ${new Date().getFullYear()} - Premium Quality, Honest Price</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[EMAIL SUCCESS] OTP email sent successfully to ${email}`)
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${email}:`, error.message)
    // Don't crash the server, just let it proceed with console OTP log for robust user registration
  }
}
