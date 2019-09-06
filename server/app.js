// Dependancies
const express = require('express')
const http = require("http");
const socketIO = require('socket.io');

// Initializations
var app = express();
var server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || "8000";

var connectedPlayers = new Map();
var numberOfPlayers = 0;

server.listen(port, () => {
    console.log('Listening to requests on http://localhost:' + port);
});


// TODO: CORS
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", '*');
//     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.get('/', (req, res) => {
    res.status(200).send("Hello World from the Server!");
});

io.on('connection', function (socket) {
    console.log("Socket connected: " + socket.id);
    
    numberOfPlayers++;
    connectedPlayers.set('player' + numberOfPlayers, { socketId: socket.id });
    console.log('players: ', connectedPlayers);
    
    socket.on('messageFromClient', function (data) {
        console.log('The client sent us a message over the TCP connection: ', data);
    });

    socket.on('disconnect', function () {
        console.log('Socket disconnected: ' + socket.id);
    });
});