import {createMessage} from "./controllers/server/message";

export default function socketIoHandler (io) {
    io.on('connect', (socket) => {
        // console.log(`Client connected with id: ${socket.id}`);
        socket.on('join_chat', async (data) => {
            const {room_id} = data;
            socket.join(room_id);
        })
        socket.on('send_message', async (data) => {
            const {message, user_id, room_id} = data;
            try {
                console.log('Я СРАБОТАЛ1', data)
                const newMessage = await createMessage(message, user_id, room_id);

                io.in(room_id).emit('new_message', newMessage);
                console.log('Я СРАБОТАЛ2', data, room_id, newMessage);
            } catch (error) {
                const errorMessage = `Failed to save message. ${error.message}`;

                socket.emit('send_message_error', {
                    message: errorMessage,
                });

            }
        })

        // socket.on('join_room', async (data) => {
        //     const { userId, roomId, username } = data;
        //
        //     try {
        //         await joinRoom(userId, roomId);
        //
        //         const joinMessage = `${username} has joined the room!`;
        //
        //         const adminUserId = await getAdminUserId();
        //         const newMessage = await createMessage(
        //             joinMessage,
        //             adminUserId,
        //             roomId
        //         );
        //
        //         // Emit a join room success event
        //         socket.emit('join_room_success');
        //
        //         // Emit the new message to all clients in the room
        //         io.in(roomId).emit('new_message', newMessage);
        //     } catch (error) {
        //         const errorMessage = `Failed to join room. ${error.message}`;
        //
        //         socket.emit('join_room_error', {
        //             message: errorMessage,
        //         });
        //     }
        // });

        socket.on('leave_chat', async (data) => {
                console.log(`Client disconnected with id: ${socket.id}`)
                const {roomId} = data
                socket.leave(roomId)
            }
        );
    });
};
//
// export default {
//     socketIoHandler,
// };
