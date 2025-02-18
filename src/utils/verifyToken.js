const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// const verifyToken = async (req, res, next) => {
//     console.table('REQ', req)
//     try {
//         const token = req.cookies.token;
//         if (!token) {
//             return res.status(401).json({ token: null });
//         }
//
//         const verified = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);
//
//         if (!verified || typeof verified !== 'object') {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
//
//         const user = await pool.query(
//             'SELECT id, username FROM users WHERE id = $1',
//             [verified.id]
//         );
//
//         if (!user.rows[0]) {
//             return res.status(401).json({ message: 'User not found' });
//         }
//
//         req.user = {
//             id: user.rows[0].id,
//             username: user.rows[0].username,
//         };
//
//         next();
//     } catch (error) {
//         console.table('REQ1', req)
//         return res.status(401).json({ message: error.message });
//     }
// };

const verifyToken = async (req, res, next) => {
   try {
       const token = req.cookies.refreshToken;
       if (!token) {
           return res.status(403).json({ message: 'Токен не предоставлен' });
       }

       jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
           if (err) {
               if (err.name === 'TokenExpiredError') {
                   return res.status(401).json({ message: 'Токен истек' });
               }
               return res.status(401).json({ message: 'Недействительный токен' });
           }

           req.user = decoded;
           next();
       });
   } catch (err) {
       return res.status(401).json({ message: err.message });
   }
};


module.exports = verifyToken;
