import express, {Express, Request, Response} from "express";
import cors from 'cors'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import socketIoHandler from './src/socket'

const cookieParser = require('cookie-parser')
const PORT = process.env.PORT
const app = express()

import {getRooms} from "./src/controllers/client/room";
import {getAllMessages} from "./src/controllers/client/message"
import messageRouter from './src/router/message'
import userRouter from './src/router/user'
import authRouter from './src/router/auth'

dotenv.config()

const corsOptions = {
	origin: 'http://192.168.0.142:3000',
	credentials: true,
	allowedHeaders: [
		'set-cookie',
		'Content-Type',
		'Access-Control-Allow-Origin',
		'Access-Control-Allow-Credentials',
	],
};
app.use(express.json())
app.use(cors(corsOptions));
app.use(cookieParser(process.env.JWT_EXPIRES_IN));

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the chat-room server')
})

const server = app.listen(PORT, () => {
	console.log(`chat-room server started at ${PORT}`)
	socketIoHandler(io)
})

app.use('/api/rooms', getRooms);
app.use('/api/messages', getAllMessages)
app.use('/api/messages', messageRouter);
app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)

const io = new Server(server, {
	pingTimeout: 60000,
	cors: {
		origin: 'http://localhost:3000',
		credentials: true,
	},
})
