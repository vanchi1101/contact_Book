// Express app //
const express = require('express');// tạo backend API server
const cors = require('cors');// cho phép frontend (React) gọi API backend
const dotenv = require('dotenv');// 
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const groupRoutes = require('./routes/groups');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());// cho phép server đọc dữ liệu JSON từ request

// Phục vụ file tĩnh từ thư mục public/imgA/
app.use('/imgA', express.static(path.join(__dirname, 'public', 'imgA')));

// Các middleware khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => res.send('Contact Book API running'));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));