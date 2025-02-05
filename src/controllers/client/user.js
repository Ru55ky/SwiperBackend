const pool = require('../../db/pool');

const getUser = async (req, res) => {
    try {
        const {id} = req.user

        const user = await pool.query(
            'SELECT id, username, image_icon FROM users WHERE id = $1',
            [id]
        )

        return res.status(200).json(user.rows[0])
    } catch (err) {
        return res.status(500).json({message: 'Пользователь не найден или не авторизован'})
    }
}

module.exports = {
    getUser
}
