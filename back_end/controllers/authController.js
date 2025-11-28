const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- 1. Đăng ký (Giữ nguyên) ---
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    try {
        const [rows] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (rows.length) return res.status(400).json({ message: 'Username or email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        // Mặc định avatar khi đăng ký là /imgA/avatarDefault.png
        const [result] = await pool.query('INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)', [username, email, hashed, '/imgA/avatarDefault.png']);
        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- 2. Đăng nhập (Giữ nguyên) ---
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    try {
        // Lấy thêm trường avatar để trả về ngay lúc login
        const [rows] = await pool.query('SELECT id, username, password, avatar, email FROM users WHERE username = ?', [username]);
        if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        
        // Trả về token và thông tin user cơ bản (bao gồm avatar để hiện lên sidebar ngay)
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                avatar: user.avatar 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- 3. [MỚI] Lấy thông tin cá nhân (Cho trang UserProfile) ---
exports.getMe = async (req, res) => {
    try {
        // Lấy tất cả các trường cần thiết từ bảng users dựa trên ID trong token
        const [rows] = await pool.query(
            'SELECT id, username, email, name, phone, address, birthday, nationality, ethnicity, avatar FROM users WHERE id = ?', 
            [req.user.id]
        );
        
        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        
        const user = rows[0];

        // Format ngày sinh từ dạng Date Object sang chuỗi "YYYY-MM-DD" để input type="date" hiển thị được
        if (user.birthday) {
            const date = new Date(user.birthday);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            user.birthday = `${year}-${month}-${day}`;
        }

        res.json(user);
    } catch (err) {
        console.error('Lỗi getMe:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- 4. [MỚI] Cập nhật thông tin cá nhân (Bao gồm đổi Pass & Avatar) ---
exports.updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        // Lấy các dữ liệu từ form gửi lên
        const { name, phone, email, address, birthday, nationality, ethnicity, password } = req.body;
        
        // Tạo câu lệnh SQL động (chỉ cập nhật password/avatar nếu có thay đổi)
        let sql = 'UPDATE users SET name=?, phone=?, email=?, address=?, birthday=?, nationality=?, ethnicity=?';
        let params = [name, phone, email, address, birthday || null, nationality, ethnicity];

        // 1. Xử lý Mật khẩu: Chỉ cập nhật nếu user có nhập vào ô Mật khẩu
        if (password && password.trim() !== '') {
            const hashed = await bcrypt.hash(password, 10);
            sql += ', password=?';
            params.push(hashed);
        }

        // 2. Xử lý Avatar: Chỉ cập nhật nếu user có upload file mới
        // (Middleware upload đã xử lý file và đặt vào req.file trước khi vào hàm này)
        if (req.file) {
            sql += ', avatar=?';
            params.push(`/imgA/${req.file.filename}`);
        }

        // Thêm điều kiện WHERE id
        sql += ' WHERE id=?';
        params.push(userId);

        // Thực thi câu lệnh Update
        await pool.query(sql, params);

        // Lấy lại thông tin mới nhất sau khi update để trả về cho Frontend
        const [rows] = await pool.query(
            'SELECT id, username, email, name, phone, address, birthday, nationality, ethnicity, avatar FROM users WHERE id = ?', 
            [userId]
        );
        
        // Format lại ngày sinh cho nhất quán
        const updatedUser = rows[0];
        if (updatedUser.birthday) {
            const date = new Date(updatedUser.birthday);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            updatedUser.birthday = `${year}-${month}-${day}`;
        }

        res.json(updatedUser);

    } catch (err) {
        console.error('Lỗi updateMe:', err);
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
};