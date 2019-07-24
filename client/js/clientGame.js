import drawMaze from "./mazeDrawing.js";

//Setup
const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");
ctx.font = '25px Arial';
ctx.fillStyle = "#525252";

const id = document.getElementById("id");
let socket = io();
let mazeGrid = [];
let sockets = [];

//Get data from server
socket.on('maze', function(data) {
    mazeGrid = data;
});
socket.on('id', function(data) {
    id.innerHTML = "your id = " + data;
});
socket.on('newPositions', function(data) {
    sockets = [];
    data.forEach(socket => {
        sockets.push(socket);
    });
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

//Draw
setInterval(function () {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMaze(mazeGrid, ctx);
    sockets.forEach(socket => {
        ctx.fillText(socket.id ,socket.x , socket.y);
    });
},1000/100);

