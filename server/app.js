// Dependencies
const express = require('express')
const http = require("http");
const socketIO = require('socket.io');
const fetch = require('node-fetch');

// Initializations
var app = express();
var server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || "8000";

// Globals
var connectedPlayers = new Map();
var activeSessions = new Map();
var activeSessionsCount = 0;
var quotes;
var statusPollingInterval;

server.listen(port, () => {
    console.log('Listening to requests on http://localhost:' + port);
});

(function () {
    fetch('https://programming-quotes-api.herokuapp.com/quotes/lang/en')
        .then(res => res.json())
        .then(json => quotes = json);
})();

// TODO: CORS
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", '*');
//     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

io.on('connection', function (socket) {
    
    // Connect
    connectedPlayers.set(socket.id, { inQueue: false, inGame: false, completionPercentage: 0 });

    // Disconnect
    socket.on('disconnect', function () {
        connectedPlayers.delete(socket.id);
    });

    // Message
    socket.on('messageFromClient', function (data) {
        console.log('The client sent us a message over the TCP connection: ', data);
    });

    // enQueue
    socket.on('enQueue', function () {
        connectedPlayers.get(socket.id).inQueue = true;
        
        if (noActiveQueuedSessions()) {
            createNewSessionAndAddPlayer(socket);
        } else {
            addPlayerToCurrentQueuedSession(socket);
        }
    });

    // Client status update
    socket.on('clientStatusUpdate', function (clientState) {
        updateClientStatus(socket, clientState);
    });
});

function updateClientStatus(socket, clientState) {
    connectedPlayers.get(socket.id).completionPercentage = clientState.completionPercentage;
}

function noActiveQueuedSessions() {
    return activeSessions && !activeSessions.get(activeSessionsCount);
}

function getRandomQuote() {
    return quotes[Math.floor(Math.random()*quotes.length)];
}

function createNewSessionAndAddPlayer(socket) {
    socket.join(activeSessionsCount);

    playersDictionary = new Object();
    playersDictionary[socket.id] = connectedPlayers.get(socket.id);

    activeSessions.set(activeSessionsCount, {
        players: playersDictionary,
        status: 'waiting for players...',
        quote: getRandomQuote()
    });

    var currentActiveSession = activeSessions.get(activeSessionsCount);
    var currentActiveSessionsCount = activeSessionsCount;

    socket.emit('JoinedSession', { caption: 'JoinedSession', sessionState: currentActiveSession });

    setTimeout(() => {
        if (currentActiveSession.status === "waiting for players...") {
            startSession(currentActiveSessionsCount, currentActiveSession);
        }
    }, 10000);
}

function setupRoomStatusPolling(roomNumber, session) {
    // This will also need to be a maintained collection so we can cancelInterval on each when the sessions ends
    statusPollingInterval = setInterval(() => {
        io.in(roomNumber).emit('serverStateUpdate', { caption: 'serverStateUpdate', sessionState: session });
    }, 1000);
}

function addPlayerToCurrentQueuedSession(socket) {
    socket.join(activeSessionsCount);
    var currentActiveSession = activeSessions.get(activeSessionsCount);
    var currentActiveSessionsCount = activeSessionsCount;

    var playersInSession = currentActiveSession.players;
    playersInSession[socket.id] = connectedPlayers.get(socket.id);

    socket.emit('JoinedSession', { caption: 'JoinedSession', sessionState: currentActiveSession });

    if (playersInSession.length === 5) {
        startSession(currentActiveSessionsCount, currentActiveSession);
    }
}

function startSession(socketRoom, session) {
    io.in(socketRoom).emit('GameStarted', { caption: 'GameStarted', sessionState: session });
    session.status = "Game started!";
    activeSessionsCount++;

    setupRoomStatusPolling(socketRoom, session);

    // TODO: refactor this (slightly convoluted/ non-semantic)
    const playersInSession = session.players;
    for (const player in session.players) {
        playersInSession[player].inGame = true;
        playersInSession[player].inQueue = false;
    }
}