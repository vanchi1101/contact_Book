const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Import Controller (Thêm getMe, updateMe)
const { register, login, getMe, updateMe } = require('../controllers/authController');

// 2. Import Middleware xác thực
// ⚠️ QUAN TRỌNG: Kiểm tra xem file trong folder 'middleware' của bạn tên là gì (authMiddleware.js hay auth.js) rồi sửa tên ở dưới cho đúng.
const verifyToken = require('../middleware/authMiddleware'); 

// 3. Cấu hình Upload ảnh (Để thay Avatar)
const uploadDir = path.join(__dirname, '..', 'public', 'imgA');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- CÁC ROUTE ---

// Route cũ
router.post('/register', register);
router.post('/login', login);

// Route MỚI (Lấy info & Cập nhật info)
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, upload.single('avatar'), updateMe);

module.exports = router;