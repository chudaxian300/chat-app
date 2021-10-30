const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessages,generateLocationMessages } = require('./utils/messages')
const Users = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('sendMessage', (message, callback) => {
        //每个用户链接后都有一个socketid,且在网络可以保持
        const user = Users.getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessages(user.username, message)) //全体广播
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = Users.getUser(socket.id)
        io.emit('locationMessage',generateLocationMessages(user.username,`https://google.com/maps/q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = Users.removeUser(socket.id)
        io.emit('message', generateMessages('System', `${user.username} has left`))
    })

    socket.on('join', (options, callback) => {
        const { error, user } = Users.addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessages('System', 'Welcome')) //单用户发送
        //向指定房间广播信息
        socket.broadcast.to(user.room).emit('message', generateMessages(`${user.username} has join`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: Users.getUsersInRoom(user.room)
        })

        callback()
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})