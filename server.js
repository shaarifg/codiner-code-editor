//Creating express Server
const express  = require('express')
const app = express();

//Import http module--inbuild in node

const http = require('http');
const path = require('path');

const {Server} = require('socket.io');
const ACTIONS = require('./src/Action');

const server = http.createServer(app);//passing object of express server

const io = new Server(server);//creating instance

app.use(express.static((path.resolve(__dirname, 'build'))));

// universal route for to serve from backend.
app.use((req, res, next)=> {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
})

const userSocketMap ={};

function getAllConnectedClients(roomId) {

    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) =>{
        return {
            socketId,
            username:userSocketMap[socketId],
            };

        }
    )
}


io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        // console.log(clients);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId:socket.id,
            })

        })
    })

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        // console.log('receiving', code);
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code});
    })
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        // console.log('receiving', code);
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});
    })

    socket.on('disconnecting', () =>{
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId:socket.id,
                username:userSocketMap[socket.id],
            })
        })
        delete userSocketMap[socket.id];
        socket.leave();
    })
})

const PORT = process.env.PORT || 5000 //if server is not available 

server.listen(PORT, ()=>{
    console.log(`Server is Running on ${PORT}`)
})

// Code My Mohammed Sharif



