const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const {playerJoin, getCurrentPlayer, getRoomPlayers, playerLeave} = require('./public/js/players')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Runs when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const player = playerJoin(socket.id, username, room)
        socket.join(player.room)

        // Send players
        io.to(player.room).emit('roomPlayers', {
            room: player.room,
            players: getRoomPlayers(player.room)
        })
    })

    // Play Action
    socket.on('play', (index) => {
        const player = getCurrentPlayer(socket.id)
        io.to(player.room).emit('playAction', player, index)
    })

    // Reset Game
    socket.on('reset', () => {
        const player = getCurrentPlayer(socket.id)
        io.to(player.room).emit('resetGame', player)
    })

    // When client disconnects
    socket.on('disconnect', () => {
        console.log('A user disconnected')
        const player = playerLeave(socket.id)

        if(player){
            io.to(player.room).emit('roomPlayers', {
                room: player.room,
                players: getRoomPlayers(player.room)
            })
        }

    })
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Server running on port ${port}..`))