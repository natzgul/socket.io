var app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const users = {}

io.on('connection', socket => {
    
    const currentUser = users[socket.id]

    // Attribution d'un nom par default
    users[socket.id] = 'Anonyme'
    console.log('user connected : ', socket.id , ' / pseudo : ', users[socket.id])
    socket.on('loaded', (data) => {
        console.log('data from client : ', data)
    })

    socket.on('pseudo', (data) => {
        console.log('Message send by', data)
        socket.broadcast.emit('pseudo', data)
    })

    socket.on('message', (data) => {
        console.log('message content', data)
        socket.broadcast.emit('message', data)
    })

    // Création la liste des clients connectés
    io.clients((error, currentUser) => {
        
        if(error){
            console.error(error)
        }else{
            io.emit('list-users', currentUser)
        }
    })

    //Socket pour la déconnexion
    socket.on('disconnect', () => {
        io.clients((error, currentUser) => {
            if(error){
                console.error(error)
            }else{
                io.emit('list-users', currentUser)
            }
        })
    })

    // Set le pseudo de l'utilisateur à l'id
    socket.on('send-pseudo', function(pseudo) {
        users[socket.id] = pseudo;
        io.emit('list-users', pseudo)
        console.log(users);
    });

})


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

http.listen(3000, () => {
    console.log('Server is up and running on http://localhost:3000')
})

