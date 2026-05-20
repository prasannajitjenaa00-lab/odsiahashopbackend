import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads folder exists
const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|svg/
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/svg\+xml/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = mimetypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp, svg)'), false)
  }
}

export const upload = multer({ storage, fileFilter })
