const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục public/imgA/ nếu chưa tồn tại
const uploadDir = path.join(__dirname, '..', 'public', 'imgA');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Kiểm tra quyền ghi
try {
  fs.accessSync(uploadDir, fs.constants.W_OK);
} catch (err) {
  console.error(`Không có quyền ghi vào thư mục ${uploadDir}. Vui lòng kiểm tra quyền truy cập.`);
  process.exit(1);
}

// Cấu hình multer cho tải ảnh lên
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Chỉ cho phép tải lên file ảnh!'));
    }
    cb(null, true);
  }
});

// Middleware xử lý lỗi multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Lỗi tải file: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT id, name, phone, email, note, created_at, address, nationality, job, gender, birthday, ethnicity, favourite, groups_lh, link_img FROM contacts WHERE user_id = ? ORDER BY name',
      [userId]
    );

    // Hàm format ngày sinh
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Format từng contact trước khi gửi đi
    const formattedRows = rows.map(contact => ({
      ...contact,
      birthday: formatDate(contact.birthday)
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('Lỗi getAll:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.create = [upload.single('avatar'), handleMulterError, async (req, res) => {
  const { name, phone, email, note, address, nationality, job, gender, birthday, ethnicity } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên là bắt buộc' });
  try {
    const userId = req.user.id;
    const link_img = req.file ? `/imgA/${req.file.filename}` : '/imgA/avatarDefault.png';
    console.log('Create - File uploaded:', req.file, 'link_img:', link_img); // Thêm log
    const [result] = await pool.query(
      'INSERT INTO contacts (user_id, name, phone, email, note, address, nationality, job, gender, birthday, ethnicity, favourite, groups_lh, link_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, phone || null, email || null, note || null, address || null, nationality || null, job || null, gender || null, birthday || null, ethnicity || null, 0, '[]', link_img]
    );
    res.status(201).json({
      id: result.insertId,
      name,
      phone,
      email,
      note,
      address,
      nationality,
      job,
      gender,
      birthday,
      ethnicity,
      favourite: 0,
      groups_lh: '[]',
      link_img
    });
  } catch (err) {
    console.error('Lỗi tạo liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}];

exports.update = [upload.single('avatar'), handleMulterError, async (req, res) => {
  const id = req.params.id;
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT id, link_img FROM contacts WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy liên hệ' });

    const updateFields = [];
    const values = [];
    const oldLinkImg = rows[0].link_img;

    // Xử lý các trường từ req.body, nếu có
    const {
      name,
      phone,
      email,
      note,
      address,
      nationality,
      job,
      gender,
      birthday,
      ethnicity,
      favourite,
      groups_lh,
      link_img
    } = req.body || {};

    if (name !== undefined) {
      if (!name) return res.status(400).json({ message: 'Tên không được để trống' });
      updateFields.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(phone || null);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email || null);
    }
    if (note !== undefined) {
      updateFields.push('note = ?');
      values.push(note || null);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      values.push(address || null);
    }
    if (nationality !== undefined) {
      updateFields.push('nationality = ?');
      values.push(nationality || null);
    }
    if (job !== undefined) {
      updateFields.push('job = ?');
      values.push(job || null);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(gender || null);
    }
    if (birthday !== undefined) {
      updateFields.push('birthday = ?');
      values.push(birthday || null);
    }
    if (ethnicity !== undefined) {
      updateFields.push('ethnicity = ?');
      values.push(ethnicity || null);
    }
    if (favourite !== undefined) {
      // Sửa lỗi: Chấp nhận cả số và chuỗi
      const favValue = Number(favourite);
      if (isNaN(favValue) || (favValue !== 0 && favValue !== 1)) {
        return res.status(400).json({ message: 'favourite phải là 0 hoặc 1' });
      }
      updateFields.push('favourite = ?');
      values.push(favValue);
    }
    if (groups_lh !== undefined) {
      updateFields.push('groups_lh = ?');
      values.push(groups_lh || '[]');
    }
    if (req.file) {
      updateFields.push('link_img = ?');
      values.push(`/imgA/${req.file.filename}`);
      // Xóa file avatar cũ nếu không phải ảnh mặc định
      if (oldLinkImg && oldLinkImg !== '/imgA/avatarDefault.png') {
        const oldFilePath = path.join(__dirname, '..', 'public', oldLinkImg);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Lỗi xóa file avatar cũ:', err);
        });
      }
    } else if (link_img !== undefined) {
      updateFields.push('link_img = ?');
      values.push(link_img || '/imgA/avatarDefault.png');
      // Xóa file avatar cũ nếu đặt lại về mặc định
      if (link_img === '/imgA/avatarDefault.png' && oldLinkImg && oldLinkImg !== '/imgA/avatarDefault.png') {
        const oldFilePath = path.join(__dirname, '..', 'public', oldLinkImg);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Lỗi xóa file avatar cũ:', err);
        });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có trường nào được cập nhật' });
    }

    const sql = `UPDATE contacts SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(id, userId);
    await pool.query(sql, values);

    // Trả về thông tin liên hệ đầy đủ sau khi cập nhật
    const [updatedRows] = await pool.query(
      'SELECT id, name, phone, email, note, address, nationality, job, gender, birthday, ethnicity, favourite, groups_lh, link_img FROM contacts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    console.log('Update - Updated contact:', updatedRows[0]); // Thêm log
    res.json(updatedRows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}];

exports.remove = async (req, res) => {
  const id = req.params.id;
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT link_img FROM contacts WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy liên hệ' });

    const link_img = rows[0].link_img;
    if (link_img && link_img !== '/imgA/avatarDefault.png') {
      const filePath = path.join(__dirname, '..', 'public', link_img);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Lỗi xóa file avatar:', err);
      });
    }

    await pool.query('DELETE FROM contacts WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Đã xóa' });
  } catch (err) {
    console.error('Lỗi xóa liên hệ:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};