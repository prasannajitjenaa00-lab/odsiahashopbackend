import { Inquiry } from '../models/index.js'
import nodemailer from 'nodemailer'

export const createInquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      subject,
      message
    })

    // Log the submission in the console
    console.log(`[CONTACT INQUIRY RECEIVED]
Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}
Message: ${message}`)

    // Attempt to send notification email to admin if credentials are set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const mailOptions = {
          from: `"OdishaShop Inquiry" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // Send to admin
          subject: `New Customer Inquiry: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #C8A951; border-radius: 10px; background-color: #ffffff; color: #111111;">
              <h2 style="color: #C8A951; text-align: center;">New Contact Form Submission</h2>
              <p>You have received a new customer message from the OdishaShop Contact Page:</p>
              <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C8A951;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
              <p style="font-size: 11px; color: #999999; text-align: center;">ODISHASHOP &copy; ${new Date().getFullYear()} · Automated Administration Portal</p>
            </div>
          `
        }

        transporter.sendMail(mailOptions)
          .then(() => console.log(`[EMAIL SUCCESS] Admin inquiry notification sent successfully`))
          .catch((err) => console.error(`[EMAIL ERROR] Admin inquiry email failed:`, err.message))
      } catch (err) {
        console.error(`[EMAIL SETUP ERROR] Failed to send admin notification email:`, err.message)
      }
    }

    res.status(201).json({ success: true, message: 'Message sent successfully! We will get back to you shortly.', inquiry })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error. Failed to save inquiry.' })
  }
}

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 })
    res.json(inquiries)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error. Failed to retrieve inquiries.' })
  }
}
