const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization'];// Lấy token từ header
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // { id, username }
        next();// cho phép chạy tiếp nếu hợp lệ
    });
};