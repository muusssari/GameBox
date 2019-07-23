const Player = require('./server/Player')
const express = require('express');
const app = express();
const serv = require('http').Server(app);
const io = require('socket.io')(serv, {});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server Started");



let SOCKET_LIST = [];
let PLAYER_LIST = [];

io.sockets.on('connection', function(socket) {
    socket.id = SOCKET_LIST.length;
    SOCKET_LIST[socket.id] = socket;
    
    let player = Player.Create(socket.id);
    PLAYER_LIST[socket.id] = player;

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('keyPress', function(data) {
        if(data.inputId=== 'left')
            player.pressingLeft = data.state;
        else if(data.inputId=== 'right')
            player.pressingRight = data.state;
        else if(data.inputId=== 'up')
            player.pressingUp = data.state;
        else if(data.inputId=== 'down')
            player.pressingDown = data.state;
    });
    //socket.emit('maze', );
});

setInterval(function () {
    var pack = [];
    for (const i in PLAYER_LIST) {
        let player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            id:player.id
        });
    }
    for (const i in SOCKET_LIST) {
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
},1000/30);

