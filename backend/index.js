const express = require('express')
const {createServer} = require('node:http')
const {Server} = require('socket.io')
const cors = require('cors');
const app = express();
const server = createServer(app)
const io = new Server(server,{
    cors:['http://localhost:5173']
})


// app.use(cors({
//     origin: ['http://localhost:3000', 'http://localhost:80','http://localhost:5173/']
// }))

// app.use(function(req,res,next){
//     // res.setHeader('Access-Control-Allow-Origin', '*');
//     // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     // res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// })
let users = {}

io.on("connection", (socket) => {

    try {    
      console.log(socket.id, " connected")
      users[socket.id] = ""
      socket.on('user-data', (data) => {
        users[socket.id] = data
        io.emit('users', users)
  
      })
  
      socket.on('offer', (data) => {
        // socket.broadcast.emit('offer', data)
        data.sender = socket.id
        io.to(data.member).emit('offer', data)
      })
  
      socket.on('answer', (data) => {
        // socket.broadcast.emit('answer', data)
        io.to(data.receiver).emit('answer', data)
      })
  
      socket.on('candidate', (data) => {
        socket.broadcast.emit('candidate', data)
      })
  
      socket.on('get-users', async (data) => {
  
        io.emit('users', users)
      })
  
      socket.on("disconnect", (reason) => {
        // ...
        delete users[socket.id]
        console.log(users)
        io.emit('users', users)
      });
  
      socket.on('call', (id) => {
        console.log('call...', id)
        io.to(id).emit('incoming-call', socket.id)
      })
  
      socket.on('deny-call', (data) => {
        console.log('deny-call', data, socket.id)
        io.to(data.member).emit('deny-call', data)
      })
  
      socket.on('webrtc-connected', (data) => {
        console.log('webrtc-connected', data, socket.id)
        io.to(data.member).emit('webtrc-connected', { member: socket.id })
      })
    } catch (error) {
      console.log(error)
    }
  });


server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });