import drawMaze from "./mazeDrawing.js";

//Setup
const main = document.getElementById("main");
const header = document.getElementById("header");
const id = document.getElementById("id");
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


//Send Button pressings to server
document.onkeydown = function(event)  {
    if(event.keyCode === 68) { //d
        socket.emit('keyPress',{inputId:'right', state: true});
    }
    else if(event.keyCode === 83) { //s
        socket.emit('keyPress',{inputId:'down', state: true});
    }
    else if(event.keyCode === 65) {  //a
        socket.emit('keyPress',{inputId:'left', state: true});
    }
    else if(event.keyCode === 87) {  //w
        socket.emit('keyPress',{inputId:'up', state: true});
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
        if(Math.abs(xNum) <= Math.abs(yNum)) {
            if(yNum > 0) {
                socket.emit('keyPress',{inputId:'down', state: true});
            }else {
                socket.emit('keyPress',{inputId:'up', state: true});
            }
        }else {
            if(xNum > 0){
                socket.emit('keyPress',{inputId:'right', state: true});
            }else {
                socket.emit('keyPress',{inputId:'left', state: true});
            }
        }
    });
}

//Draw
function startGame() {
    main.innerHTML = "";
    header.innerHTML = "Maze Game <spam>"+ myId +"</spam>" ;
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
    setInterval(function () {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawMaze(mazeGrid, ctx);
        sockets.forEach(socket => {
            ctx.beginPath();
            if(socket.id == myId) {
                ctx.fillStyle = "#a1dd70";
            }else {
                ctx.fillStyle = "#6c7b95";
            }
            ctx.fillRect(socket.x, socket.y, w/3,w/3);
            ctx.stroke();
        });
    },1000/100);
}
//Lobby
function CreateMain() {
    const button = document.createElement('button');
    button.value = "button";
    button.innerHTML = "Player";
    button.addEventListener("click", () => { loadLobby(false)});
    main.appendChild(button);
}
CreateMain();
function loadLobby(set) {
    if(set) {
        socket.emit('addPlayer', {id:myId, state:true});
    }else {
        socket.emit('addPlayer', {id:myId, state:false});
    }
}

function refressLobby(data) {
    header.innerHTML = "Game Lobby <spam>"+ myId +"</spam>"
    lobby = [];
    data.forEach((d) => {
        lobby.push(d.ready);
    });
    main.innerHTML = "<h1>Players In lobby (Min Players 2):</h1>";
    data.forEach((user) => {
        main.innerHTML += "<p>Name: " + user.id +"  Ready?:"+ user.ready+ "</p>";
    });
    const button = document.createElement('button');
    button.value = "button";
    button.innerHTML = "ready";
    button.addEventListener("click", () => { loadLobby(true)});
    main.appendChild(button);
    if(lobby.length >= 2) {
        if(checkLobbyReady()) {
            const start = document.createElement('button');
            start.value = "button";
            start.innerHTML = "start";
            start.addEventListener("click", () => {socket.emit('startGame',true);});
            main.appendChild(start);
        }
    }
}
function checkLobbyReady() {
    let x = true;
    lobby.forEach((player) => {
        if(!player) {
            x = false;
        }
    });
    return x;
}

