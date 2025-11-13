const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const contactsController = require('../controllers/contactsController');

router.use(auth);
router.get('/', contactsController.getAll);
router.post('/', contactsController.create);
router.put('/:id', contactsController.update);
router.delete('/:id', contactsController.remove);

// PUT /api/contacts/:id
// router.put("/:id", authMiddleware, async (req, res) => {
//     try {
//         const {name, phone, email, note} = req.body;
//         await db.query(
//             "UPDATE contacts SET name=?, phone=?, email=?, note=? WHERE id=? AND user_id=?",
//             [name, phone, email, note, req.params.id, req.user.id]
//         );
//         res.json({ id: req.params.id, name, phone, email, note });
//     } catch (error) {
//         console.error(err);
//         res.status(500).json({ error: "Lỗi khi cập nhật liên lạc" });
//     }
// })

module.exports = router;