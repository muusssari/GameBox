import setupMaze from "./maze.js";
const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");
ctx.font = '25px Arial';
ctx.fillStyle = "#525252";

const id = document.getElementById("id");
let socket = io();
let mazeGrid = setupMaze();
let sockets = [];

socket.on('newPositions', function(data) {
    sockets = [];
    data.forEach(socket => {
        sockets.push(socket);
    });
});

function drawMaze(){
    for(let i = 0; i < mazeGrid.length; i++) {
        mazeGrid[i].draw(ctx);
    }
}
/*document.onkeydown = function(event)  {
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
}*/
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

setInterval(function () {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMaze();
    sockets.forEach(socket => {
        ctx.fillText(socket.id ,socket.x , socket.y);
        id.innerHTML = "your id = " + socket.id;
    });
},1000/100);

