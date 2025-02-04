const express = require('express');
const router = express.Router();
const {
    getUser,
    // updateUser,
    // getJoinedRooms,
    // registerUser,
    // removeRoom,
} = require('../controllers/client/auth');
const verifyToken = require('../utils/verifyToken');

 router.get('/', verifyToken, () => getUser);
// router.put('/', verifyToken, updateUser);
// router.get('/rooms', verifyToken, getJoinedRooms);
// router.post('/rooms/:id/remove', verifyToken, removeRoom);

module.exports = router;
