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
serv.listen(process.env.PORT || 2000);
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
        let player = PLAYER_LIST[socket.id]
        if(player.lobby != null){
            for(let i = 0; i < LOBBIES[player.lobby].players.length; i++) {
                if(LOBBIES[player.lobby].players[i].id == socket.id){
                    LOBBIES[player.lobby].players.splice(i,1);
                }
            }
        }
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        
    });
    socket.on('keyPress', function(data) {
        if(player.inGame) {
            if(data.inputId=== 'left' && !player.currentCell.walls[3]) {
                player.pressingLeft = data.state;
                player.currentCell = LOBBIES[player.lobby].maze[Maze.index(player.currentCell.i-1,player.currentCell.j)];
            }
            else if(data.inputId=== 'right' && !player.currentCell.walls[1]){
                player.pressingRight = data.state;
                player.currentCell = LOBBIES[player.lobby].maze[Maze.index(player.currentCell.i+1,player.currentCell.j)];
            }
            else if(data.inputId=== 'up' && !player.currentCell.walls[0]){
                player.pressingUp = data.state;
                player.currentCell = LOBBIES[player.lobby].maze[Maze.index(player.currentCell.i,player.currentCell.j-1)];
            }
            else if(data.inputId=== 'down' && !player.currentCell.walls[2]){
                player.pressingDown = data.state;
                player.currentCell = LOBBIES[player.lobby].maze[Maze.index(player.currentCell.i,player.currentCell.j+1)];
            }

            if(player.currentCell.goal) {
                console.log("winner");
                winnerScoreScreen(player.lobby, player.id);
            }
        }
    });
    socket.on('setReady', function(r) {
        PLAYER_LIST[socket.id].isReady=r;
    });
    socket.on('startGame', function(id) {
        LOBBIES[id].game = true;
        LOBBIES[id].maze = Maze.setupMaze();
        const players = LOBBIES[id].players;
        for(let i = 0; i < players.length; i++) {
            const p = players[i];
            p.init(LOBBIES[id].maze[0]);
            const socket = SOCKET_LIST[p.id];
            socket.emit('startGame', LOBBIES[id].maze);
        }
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
    });
    socket.on('BackToMain', function() {
        PLAYER_LIST[socket.id].endGame();
    });
    socket.emit('id', socket.id);
});

function winnerScoreScreen(lobbyId, winnerID) {
    for(let i = 0; i < LOBBIES[lobbyId].players.length; i++) {
        const player = LOBBIES[lobbyId].players[i];
        const socket = SOCKET_LIST[player.id];
        socket.emit('winner', winnerID);
        player.GameEnd = true;
        player.inGame = false;
    }
}

let timer = 0;
setInterval(function () {
    let pack = [];
    for(let l = 0; l < LOBBIES.length; l++) {
        let lob = [];
        for(let p = 0; p < LOBBIES[l].players.length; p++){
            const player = LOBBIES[l].players[p];
            player.updatePosition();
            lob.push({
                x:player.x,
                y:player.y,
                id:player.id
            });
        }
        pack.push(lob);
    }
    for (const i in PLAYER_LIST) {
        const player = PLAYER_LIST[i];
        const socket = SOCKET_LIST[i];
        if(player.GameEnd) {
            return;
        }
        else if(player.inGame){
            socket.emit('newPositions', pack[player.lobby]);
        }
        else if(player.lobby == null && timer >= 15){
            socket.emit('lobbyList', LOBBIES);
            //console.log(i, "not in lobby");
        }else if(player.lobby != null && timer >= 15){
            socket.emit('inLobby', LOBBIES[player.lobby]);
            //console.log(i, "in lobby");
        }
        
    }
    if(timer > 15) {
        timer = 0;
        //console.log("refress lobby");
    }
    timer++;

    /*for(let c = 0; c < LOBBIES.length; c++) {
        if(LOBBIES[c].players.length == 0) {
            //LOBBIES.splice(c,1);
        }
    }*/
},2000/20); //refress lobby every 2 sec
