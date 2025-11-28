const db = require('../db');

// Lấy tất cả nhóm
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM ggroups WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tải nhóm' });
  }
};

// Tạo nhóm mới
exports.create = async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ message: "Tên nhóm không được để trống" });

  try {
    const [result] = await db.execute(
      'INSERT INTO ggroups (user_id, name, color) VALUES (?, ?, ?)',
      [req.user.id, name, color || '#000000']
    );
    res.json({ id: result.insertId, name, color: color || '#000000' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo nhóm' });
  }
};

// Cập nhật nhóm
exports.update = async (req, res) => {
  const { name, color } = req.body;
  const { id } = req.params;

  try {
    await db.execute('UPDATE ggroups SET name=?, color=? WHERE id=? AND user_id=?', [
      name, color, id, req.user.id
    ]);
    res.json({ id, name, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật nhóm' });
  }
};

// Xóa nhóm
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM ggroups WHERE id=? AND user_id=?', [id, req.user.id]);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xóa nhóm' });
  }
};
