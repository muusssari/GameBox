import drawMaze from "./mazeDrawing.js";
import CustomAlert from "./customAlert.js";

const customAlert = new CustomAlert();
//Setup
const main = document.getElementById("main");
const header = document.getElementById("header");
let socket = io();
let mazeGrid = [];
let sockets = [];
let lobby = [];
let myId;

//Get data from server
socket.on('playersLobby', function(data) {
    refressLobby(data);
});
socket.on('id', function(data) {
    myId = data;
});
socket.on('newPositions', function(data) {
    sockets = [];
    data.forEach(socket => {
        sockets.push(socket);
    });
});
socket.on('startGame', function(data) {
    mazeGrid = data;
    startGame();
});
socket.on('winner', function(data) {
    customAlert.render("winner is " + data, myId);
    const button = document.createElement('button');
    button.innerHTML = "Back to menu";
    button.addEventListener("click", CreateMain);
    document.getElementById('main').appendChild(button);
});
socket.on('lobbyList', function(data) {
    CreateMain(data);
});
socket.on('inLobby', function(data) {
    CreateLobby(data);
});


//Send Button pressings to server
document.onkeydown = function(event) {
    if (event.keyCode === 68) { //d
        socket.emit('keyPress', { inputId: 'right', state: true });
    } else if (event.keyCode === 83) { //s
        socket.emit('keyPress', { inputId: 'down', state: true });
    } else if (event.keyCode === 65) { //a
        socket.emit('keyPress', { inputId: 'left', state: true });
    } else if (event.keyCode === 87) { //w
        socket.emit('keyPress', { inputId: 'up', state: true });
    }
}

function setCanvasTouch(canvas) {
    let xStart;
    let yStart;
    let x;
    let y;
    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        x = event.targetTouches[0].clientX;
        y = event.targetTouches[0].clientY;
    });
    canvas.addEventListener("touchstart", function(event) {
        event.preventDefault();
        xStart = event.targetTouches[0].clientX;
        yStart = event.targetTouches[0].clientY;
    });
    canvas.addEventListener("touchend", function() {
        event.preventDefault();
        const xNum = x - xStart;
        const yNum = y - yStart;
        if (Math.abs(xNum) <= Math.abs(yNum)) {
            if (yNum > 0) {
                socket.emit('keyPress', { inputId: 'down', state: true });
            } else {
                socket.emit('keyPress', { inputId: 'up', state: true });
            }
        } else {
            if (xNum > 0) {
                socket.emit('keyPress', { inputId: 'right', state: true });
            } else {
                socket.emit('keyPress', { inputId: 'left', state: true });
            }
        }
    });
}
function createNewLobby() {
    socket.emit('CreateLobby', true);
}
function joinlobby(id) {
    socket.emit('joinLobby', id);
}
function leaveLobby(id) {
    socket.emit('leaveLobby', id);
}

//Draw
function startGame() {
    main.innerHTML = "";
    header.innerHTML = "Maze Game <spam>" + myId + "</spam>";
    const canvas = document.createElement('canvas');
    canvas.id = "ctx";
    canvas.width = 370;
    canvas.height = 370;
    const w = mazeGrid[0].w;
    main.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.font = '25px Arial';
    ctx.fillStyle = "#525252";
    setCanvasTouch(canvas);
    setInterval(function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze(mazeGrid, ctx);
        sockets.forEach(socket => {
            ctx.beginPath();
            if (socket.id == myId) {
                ctx.fillStyle = "#a1dd70";
            } else {
                ctx.fillStyle = "#6c7b95";
            }
            ctx.fillRect(socket.x, socket.y, w / 3, w / 3);
            ctx.stroke();
        });
    }, 1000 / 100);
}

function showHelp() {
    console.log('Instruction\nOn desktop use w,a,s,d to move\nOn mobile wipe direction that you want to move')
    alert('Instruction\nOn desktop use w,a,s,d to move\nOn mobile wipe direction that you want to move');
}
//Lobby
function CreateMain(data) {
    main.innerHTML = "";
    const div = document.createElement('div');
    div.setAttribute("id", "text");
    const ul = document.createElement('ul');
    if(data) {
        data.forEach(lobby => {
            const li = document.createElement('li');
            const text = document.createElement('p');
            text.innerHTML = "Lobby Name: " + lobby.id + " Players: " + lobby.players.length + " / 10    ";
            const button = document.createElement('button');
            button.innerHTML = "Join Game";
            button.addEventListener("click", () =>{ joinlobby(lobby.id) } );
            text.appendChild(button);
            li.appendChild(text);
            ul.appendChild(li);
        });
    }
    div.appendChild(ul);
    const button3 = document.createElement('button');
    button3.innerHTML = "Start New Lobby";
    const button2 = document.createElement('button');
    button2.innerHTML = "help";
    button2.addEventListener("click", showHelp);
    button3.addEventListener("click", createNewLobby);
    main.appendChild(button3);
    main.appendChild(button2);
    main.appendChild(div);
}
function CreateLobby(data) {
    main.innerHTML = "";
    const div = document.createElement('div');
    div.setAttribute("id", "text");
    const ul = document.createElement('ul');
    if(data.players) {
        data.players.forEach(player => {
            const li = document.createElement('li');
            const text = document.createElement('p');
            text.innerHTML = "Player id " + player.id + "   ";
            const button = document.createElement('button');
            if(player.id == myId) {
                button.innerHTML = "Leave";
                button.addEventListener("click", () => { leaveLobby(player.lobby) });
            }else {
                button.innerHTML = "vote kick";
                button.addEventListener("click", () => { console.log("kick here") });
            }
            
            text.appendChild(button);
            li.appendChild(text);
            ul.appendChild(li);
        });
    }
    div.appendChild(ul);
    
    const button2 = document.createElement('button');
    button2.innerHTML = "help";
    button2.addEventListener("click", showHelp);
    main.appendChild(button2);
    main.appendChild(div);
}

function loadLobby(set) {
    if (set) {
        socket.emit('addPlayer', { id: myId, state: true });
    } else {
        socket.emit('addPlayer', { id: myId, state: false });
    }
}

function refressLobby(data) {
    header.innerHTML = "Game Lobby <spam>" + myId + "</spam>"
    lobby = [];
    data.forEach((d) => {
        lobby.push(d.ready);
    });
    main.innerHTML = "<h1>Players In lobby (Min Players 2):</h1>";
    const div = document.createElement('div');
    div.setAttribute("id", "text");
    data.forEach((user) => {
        main.innerHTML += "<p>Name: " + user.id + "  Ready?:" + user.ready + "</p>";
    });
    const button = document.createElement('button');
    button.value = "button";
    button.innerHTML = "ready";
    button.addEventListener("click", () => { loadLobby(true) });
    const button2 = document.createElement('button');
    button2.innerHTML = "help";
    button2.addEventListener("click", showHelp);
    div.appendChild(button);
    div.appendChild(button2);
    main.appendChild(div);
    if (lobby.length >= 2) {
        if (checkLobbyReady()) {
            const start = document.createElement('button');
            start.value = "button";
            start.innerHTML = "start";
            start.addEventListener("click", () => { socket.emit('startGame', true); });
            main.appendChild(start);
        }
    }
}

function checkLobbyReady() {
    let x = true;
    lobby.forEach((player) => {
        if (!player) {
            x = false;
        }
    });
    return x;
}