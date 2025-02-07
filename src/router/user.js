const express = require('express');
const router = express.Router();
const {
    // updateUser,
    // getJoinedRooms,
    // registerUser,
    // removeRoom,
} = require('../controllers/client/auth');
const {getUser} = require('../controllers/client/user')
const verifyToken = require('../utils/verifyToken');

 router.get('/', verifyToken, getUser);
// router.put('/', verifyToken, updateUser);
// router.get('/rooms', verifyToken, getJoinedRooms);
// router.post('/rooms/:id/remove', verifyToken, removeRoom);

module.exports = router;
