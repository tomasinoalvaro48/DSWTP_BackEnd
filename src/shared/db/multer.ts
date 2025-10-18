import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadPath = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === 'application/pdf') cb(null, true)
  else cb(new Error('Solo se permiten archivos PDF'), false)
}

export const upload = multer({ storage, fileFilter })