const express = require('express');
const { createUser, deleteUser, editUser } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', verifyToken, createUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.put('/edit/:id', verifyToken, editUser);

module.exports = router;
