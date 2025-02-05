import validateForm from "../../utils/validateForm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db/pool";
import authSchema from '../../schema/auth'
import {signedCookie} from "cookie-parser";

const registerUser = async (req, res) => {
    const { mail, password, username } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // await validateForm(authSchema, req.body);

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const role = 'default'

        const existingUser = await client.query(
            'SELECT * FROM users WHERE username = $1 OR mail = $2',
            [username, mail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await client.query(
            'INSERT INTO users (username, hashed_password, mail) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, mail]
        );

        const token = jwt.sign(
            {
                id: newUser.rows[0].id,
                mail: newUser.rows[0].mail,
                // role: newUser.rows[0].role,
                username: newUser.rows[0].username
            },
            `${process.env.JWT_SECRET_KEY}`,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );

        res.cookie('token', token, {
            secure: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict'
        });

        await client.query('COMMIT');

        return res.status(201).json({
            id: newUser.rows[0].id,
            mail: newUser.rows[0].mail,
            // role: newUser.rows[0].role,
            username: newUser.rows[0].username,
        });
    } catch (error) {
        await client.query('ROLLBACK');

        // Validation Error
        if (error.validationError) {
            return res.status(400).json({ message: error.message });
        } else {
            return res.status(500).json({ message: error.message });
        }
    } finally {
        client.release();
    }
};

const loginUser = async (req, res) => {
    try {
        const {username, password, mail} = req.body

        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1', [username]
        )

        if(user.rows.length === 0) {
            return res.status(400).json({message: 'Неправильный логин или пароль'})
        }

        const matchedPassword = await bcrypt.compare(password, user.rows[0].hashed_password)
        if(!matchedPassword) {
            return res.status(400).json({message: 'Неправильный пароль'})
        }

        const accessToken = jwt.sign(
            {id: user.rows[0].id, username: user.rows[0].username},
            `${process.env.JWT_SECRET_KEY}`,
            { expiresIn: '15m' });

        const refreshToken = jwt.sign(
            {id: user.rows[0].id, username: user.rows[0].username},
            `${process.env.JWT_SECRET_KEY}`,
            { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        });

        return res.status(200).json({
            id: user.rows[0].id,
            username: user.rows[0].username,
            rooms: user.rows[0].rooms,
            role: user.rows[0].role,
            image_icon: user.rows[0].image_icon,
            mail: user.rows[0].mail,
            accessToken: accessToken
        })

    } catch (err) {
        if(err.validationError) {
            return res.status(400).json({message: err.message})
        } else {
            return res.status(500).json({message: err.message})
        }
    }
}
 const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refreshToken')
        return res.status(200).json({message: 'logout is successfully'})
    } catch (err) {
        if(err.validationError) {
            return res.status(400).json({message: err.message})
        } else {
            return res.status(500).json({message: err.message})
        }
    }
 }

module.exports = {
    registerUser,
    loginUser,
    logoutUser
}
