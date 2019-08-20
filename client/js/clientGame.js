import drawMaze from './mazeDrawing.js'
import CustomAlert from './customAlert.js'

const customAlert = new CustomAlert()
// Setup
const main = document.getElementById('main')
const header = document.getElementById('header')
const socket = io()
let mazeGrid = []
let Players = []
let myId

// Get data from server
socket.on('playersLobby', function (data) {
  refressLobby(data)
})
socket.on('id', function (data) {
  myId = data
})
socket.on('newPositions', function (data) {
  Players = data
})
socket.on('startGame', function (data) {
  mazeGrid = data
  startGame()
})
socket.on('winner', function (data) {
  customAlert.render('winner is ' + data, myId)
  const button = document.createElement('button')
  button.innerHTML = 'Back to menu'
  button.addEventListener('click', () => { socket.emit('BackToMain', false) })
  document.getElementById('main').appendChild(button)
})
socket.on('lobbyList', function (data) {
  CreateMain(data)
})
socket.on('inLobby', function (data) {
  CreateLobby(data)
})

// Send Button pressings to server
document.onkeydown = function (event) {
  if (event.keyCode === 68) { // d
    socket.emit('keyPress', { inputId: 'right', state: true })
  } else if (event.keyCode === 83) { // s
    socket.emit('keyPress', { inputId: 'down', state: true })
  } else if (event.keyCode === 65) { // a
    socket.emit('keyPress', { inputId: 'left', state: true })
  } else if (event.keyCode === 87) { // w
    socket.emit('keyPress', { inputId: 'up', state: true })
  }
}

function setCanvasTouch (canvas) {
  let xStart
  let yStart
  let x
  let y
  window.addEventListener('touchmove', function (event) {
    event.preventDefault()
    x = event.targetTouches[0].clientX
    y = event.targetTouches[0].clientY
  }, { passive: false })
  window.addEventListener('touchstart', function (event) {
    event.preventDefault()
    xStart = event.targetTouches[0].clientX
    yStart = event.targetTouches[0].clientY
  }, { passive: false })
  window.addEventListener('touchend', function () {
    event.preventDefault()
    const xNum = x - xStart
    const yNum = y - yStart
    if (Math.abs(xNum) <= Math.abs(yNum)) {
      if (yNum > 0) {
        socket.emit('keyPress', { inputId: 'down', state: true })
      } else {
        socket.emit('keyPress', { inputId: 'up', state: true })
      }
    } else {
      if (xNum > 0) {
        socket.emit('keyPress', { inputId: 'right', state: true })
      } else {
        socket.emit('keyPress', { inputId: 'left', state: true })
      }
    }
  }, { passive: false })
}
function createNewLobby () {
  socket.emit('CreateLobby', true)
}
function joinlobby (id) {
  socket.emit('joinLobby', id)
}
function leaveLobby (id) {
  socket.emit('leaveLobby', id)
}

// Draw
function startGame () {
  main.innerHTML = ''
  header.innerHTML = 'Maze Game <spam>' + myId + '</spam>'
  const canvas = document.createElement('canvas')
  canvas.id = 'ctx'
  canvas.width = 370
  canvas.height = 370
  const w = mazeGrid[0].w
  main.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.font = '25px Arial'
  ctx.fillStyle = '#525252'
  setCanvasTouch(canvas)
  setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawMaze(mazeGrid, ctx)
    Players.forEach(p => {
      ctx.beginPath()
      if (p.id == myId) {
        ctx.fillStyle = '#a1dd70'
      } else {
        ctx.fillStyle = '#6c7b95'
      }
      ctx.fillRect(p.x, p.y, w / 3, w / 3)
      ctx.stroke()
    })
  }, 1000 / 25)
}

function showHelp () {
  console.log('Instruction\nOn desktop use w,a,s,d to move\nOn mobile wipe direction that you want to move')
  alert('Instruction\nOn desktop use w,a,s,d to move\nOn mobile wipe direction that you want to move')
}
// Lobby
function CreateMain (data) {
  main.innerHTML = ''
  const div = document.createElement('div')
  div.setAttribute('id', 'text')
  const ul = document.createElement('ul')
  if (data) {
    data.forEach(lobby => {
      const li = document.createElement('li')
      const text = document.createElement('p')
      text.innerHTML = 'Lobby Name: Maze Game - ' + lobby.id + ' Players: ' + lobby.players.length + ' / 10    '
      const button = document.createElement('button')
      button.innerHTML = 'Join Game'
      button.addEventListener('click', () => { joinlobby(lobby.id) })
      text.appendChild(button)
      li.appendChild(text)
      ul.appendChild(li)
    })
  }
  div.appendChild(ul)
  const button3 = document.createElement('button')
  button3.innerHTML = 'Start New Lobby'
  const button2 = document.createElement('button')
  button2.innerHTML = 'help'
  button2.addEventListener('click', showHelp)
  button3.addEventListener('click', createNewLobby)
  const remane = document.createElement('button')
  remane.innerHTML = 'rename'
  remane.addEventListener('click', () => {
    const name = prompt('Enter your nikname')
    if (name != null && !name.includes(' ')) {
      socket.emit('changeName', name)
    }
  })
  main.appendChild(button3)
  main.appendChild(button2)
  main.appendChild(remane)
  main.appendChild(div)
}
function CreateLobby (data) {
  main.innerHTML = ''
  const div = document.createElement('div')
  div.setAttribute('id', 'text')
  const ul = document.createElement('ul')
  if (data.players) {
    data.players.forEach(player => {
      const li = document.createElement('li')
      const text = document.createElement('p')
      text.innerHTML = 'Player name: ' + player.name + '   '
      const button = document.createElement('button')
      const buttonReady = document.createElement('button')
      const readyText = document.createElement('spam')
      if (player.id == myId) {
        button.innerHTML = 'Leave'
        button.addEventListener('click', () => { leaveLobby(player.lobby) })
      } else {
        button.innerHTML = 'vote kick'
        button.addEventListener('click', () => { console.log('kick here') })
      }

      if (player.isReady && player.id == myId) {
        buttonReady.innerHTML = 'Ready'
        buttonReady.addEventListener('click', () => { socket.emit('setReady', false) })
        text.appendChild(buttonReady)
      } else if (player.id == myId) {
        buttonReady.innerHTML = 'Not Ready'
        buttonReady.addEventListener('click', () => { socket.emit('setReady', true) })
        text.appendChild(buttonReady)
      } else {
        if (player.isReady) {
          readyText.innerHTML = ' Ready '
        } else {
          readyText.innerHTML = ' Not Ready '
        }
        text.appendChild(readyText)
      }

      text.appendChild(button)
      li.appendChild(text)
      ul.appendChild(li)
    })
  }
  div.appendChild(ul)
  if (checkLobbyReady(data.players) && data.players.length > 0) {
    const startButton = document.createElement('button')
    startButton.innerHTML = 'Start Game'
    startButton.addEventListener('click', () => { socket.emit('startGame', data.id) })
    div.appendChild(startButton)
  }
  const button2 = document.createElement('button')
  button2.innerHTML = 'help'
  button2.addEventListener('click', showHelp)
  const remane = document.createElement('button')
  remane.innerHTML = 'rename'
  remane.addEventListener('click', () => {
    const name = prompt('Enter your nikname')
    if (name != null && !name.includes(' ')) {
      socket.emit('changeName', name)
    }
  })
  main.appendChild(button2)
  main.appendChild(remane)
  main.appendChild(div)
}

function checkLobbyReady (players) {
  let x = true
  players.forEach((player) => {
    if (!player.isReady) {
      x = false
    }
  })
  return x
}
