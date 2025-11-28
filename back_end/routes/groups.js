const express = require('express');
const router = express.Router();
const db = require('../db'); // pool MySQL

// Lấy tất cả nhóm
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM ggroups WHERE user_id = ?", [req.query.user_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tải nhóm" });
  }
});

// Thêm nhóm mới
router.post('/', async (req, res) => {
  const { user_id, name, color } = req.body;
  if (!name) return res.status(400).json({ message: "Group name cannot be empty" });

  try {
    const [result] = await db.execute(
      "INSERT INTO ggroups (user_id, name, color) VALUES (?, ?, ?)",
      [user_id, name, color || "#000000"]
    );
    res.json({ id: result.insertId, name, color: color || "#000000" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating group" });
  }
});

// Đổi tên hoặc màu nhóm
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  if (!name && !color) return res.status(400).json({ message: "Nothing to update" });

  try {
    const updates = [];
    const values = [];
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (color) {
      updates.push("color = ?");
      values.push(color);
    }
    values.push(id);

    const sql = `UPDATE ggroups SET ${updates.join(", ")} WHERE id = ?`;
    await db.execute(sql, values);
    res.json({ message: "Group updated successfully", id, name, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating group" });
  }
});

// Xóa nhóm
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Nếu muốn, trước khi xóa nhóm, có thể xóa/clear các liên hệ thuộc nhóm này
    await db.execute("DELETE FROM ggroups WHERE id = ?", [id]);
    res.json({ message: "Group deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting group" });
  }
});

module.exports = router;
