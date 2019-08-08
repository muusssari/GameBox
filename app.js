const Player = require('./server/Player')
const Lobby = require('./server/lobbies')
const Maze = require('./server/maze')
const express = require('express');
const app = express();
const serv = require('http').Server(app);
const io = require('socket.io')(serv, {});
const path = require('path');


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
app.use(express.static(path.join(__dirname, 'client')));
serv.listen(2000);
console.log("Server Started");

let grid = Maze.setupMaze();
//Players has same soket and player id
const SOCKET_LIST = [];
const PLAYER_LIST = [];

//lobbies
let LOBBIES = [];
LOBBIES.push(Lobby.creteLobby(LOBBIES.length));


//LOBBIES[1].AddPlayer(Player.Create(0, grid[0]))

io.sockets.on('connection', function(socket) {
    socket.id = SOCKET_LIST.length;
    SOCKET_LIST[socket.id] = socket;
    
    let player = Player.Create(socket.id, grid[0]);
    PLAYER_LIST[socket.id] = player;

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('keyPress', function(data) {
        if(player.inGame) {
            if(data.inputId=== 'left' && !player.currentCell.walls[3]) {
                player.pressingLeft = data.state;
                player.currentCell = grid[Maze.index(player.currentCell.i-1,player.currentCell.j)];
            }
            else if(data.inputId=== 'right' && !player.currentCell.walls[1]){
                player.pressingRight = data.state;
                player.currentCell = grid[Maze.index(player.currentCell.i+1,player.currentCell.j)];
            }
            else if(data.inputId=== 'up' && !player.currentCell.walls[0]){
                player.pressingUp = data.state;
                player.currentCell = grid[Maze.index(player.currentCell.i,player.currentCell.j-1)];
            }
            else if(data.inputId=== 'down' && !player.currentCell.walls[2]){
                player.pressingDown = data.state;
                player.currentCell = grid[Maze.index(player.currentCell.i,player.currentCell.j+1)];
            }

            if(player.currentCell.goal) {
                console.log("winner");
                winnerScoreScreen(player.id);
            }
        }
    });
    socket.on('startGame', function() {
        grid = Maze.setupMaze();
        for (const i in PLAYER_LIST) {
            const player = PLAYER_LIST[i];
            if(INLOBBY.includes(player.id)) {
                player.init(grid[0]);
                player.inGame = true;
                player.inLobby = false;
            }
        }
        for (const i in SOCKET_LIST) {
            const socket = SOCKET_LIST[i];
            if(INLOBBY.includes(socket.id)){
                INGAME.push(socket.id);
                socket.emit('startGame', grid);
            }
        }
        INLOBBY = [];
    });
    socket.on('joinLobby', function(id) {
        LOBBIES[id].AddPlayer(PLAYER_LIST[socket.id]);
        const player = PLAYER_LIST[socket.id];
        player.lobby = id;
    });
    socket.on('leaveLobby', function(id) {
        for(let i = 0; i < LOBBIES[id].players.length; i++) {
            if(LOBBIES[id].players[i].id == socket.id){
                LOBBIES[id].players.splice(i,1);
            }
        }
        PLAYER_LIST[socket.id].lobby = null;
        
    });
    socket.on('CreateLobby', function() {
        const len = LOBBIES.length;
        LOBBIES.push(Lobby.creteLobby(len));
        const player = PLAYER_LIST[socket.id];
        player.lobby = len;
        LOBBIES[len].AddPlayer(player);
        socket.emit('inLobby', LOBBIES[len]);
    })
    socket.emit('id', socket.id);
});

function winnerScoreScreen(winnerID) {
    for (const i in PLAYER_LIST) {
        const player = PLAYER_LIST[i];
        if(INGAME.includes(player.id)) {
            player.inGame = false;
        }
    }
    for (const i in SOCKET_LIST) {
        const socket = SOCKET_LIST[i];
        if(INGAME.includes(socket.id)){
            socket.emit('winner', winnerID);
        }
    }
    INGAME = [];
}

function addPlayerToLobby(data) {
    const player = PLAYER_LIST[data.id];
        player.isReady = data.state;
        if(!INLOBBY.includes(data.id)) {
            INLOBBY.push(data.id);
        }
        player.inLobby = true;
        let pack = [];
        for (const i in PLAYER_LIST) {
            const player = PLAYER_LIST[i];
            if(player.inLobby) {
                pack.push({
                    ready:player.isReady,
                    id:player.id
                });
            }
        }
        
        for (const i in SOCKET_LIST) {
            const socket = SOCKET_LIST[i];
            if(INLOBBY.includes(socket.id)){
                socket.emit('playersLobby', pack);
            }
        }
}

/*setInterval(function () {
    let pack = [];
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
},1000/30);*/
let timer = 0;
setInterval(function () {
    for (const i in PLAYER_LIST) {
        const player = PLAYER_LIST[i];
        const socket = SOCKET_LIST[i];
        if(player.lobby == null && timer >= 25){
            socket.emit('lobbyList', LOBBIES);
            //console.log(i, "not in lobby");
        }else if(player.lobby != null && timer >= 25){
            socket.emit('inLobby', LOBBIES[player.lobby]);
            //console.log(i, "in lobby");
        }
        
        if(player.inGame){
            socket.emit('game', LOBBIES[player.lobby]);
        }
    }
    if(timer > 25) {
        timer = 0;
        //console.log("refress lobby");
    }
    timer++;
},2000/25); //refress lobby every 2 sec
