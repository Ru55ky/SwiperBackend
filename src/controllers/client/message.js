const pool = require('../../db/pool')
// const validateForm = require('../../utils/validateForm');
// const {messageSchema} = require('../../')

const getAllMessages = async (req, res) => {
    const { room_id } = req.query;
    if (!room_id) return res.status(400).json({ message: 'Room ID is required' });

    try {
        const messages = await pool.query(
            'SELECT messages.*, users.image_icon, users.username FROM messages LEFT JOIN users ON messages.user_id = users.id WHERE messages.room_id = $1 ORDER BY messages.created_at DESC LIMIT 100',
            [room_id]
        );

        return res.status(200).json(messages.rows);
    } catch (error) {
        console.error('error', error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getAllMessages
}

