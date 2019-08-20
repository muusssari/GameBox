
const CreatePlayer = function (id, cell, name) {
  const self = {
    x: 0,
    y: 0,
    id: id,
    name: (name) || 'quest ' + id,
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false,
    maxSpd: cell.w,
    currentCell: cell,
    isReady: false,
    inGame: false,
    GameEnd: false,
    lobby: null
  }
  self.init = function (cell) {
    self.x = cell.w / 3
    self.y = cell.w / 3
    self.currentCell = cell
    self.inGame = true
  }
  self.endGame = function () {
    self.inGame = false
    self.isReady = false
    self.GameEnd = false
  }
  self.updatePosition = function () {
    if (self.pressingRight) { self.x += self.maxSpd }
    self.pressingRight = false
    if (self.pressingLeft) { self.x -= self.maxSpd }
    self.pressingLeft = false
    if (self.pressingUp) { self.y -= self.maxSpd }
    self.pressingUp = false
    if (self.pressingDown) { self.y += self.maxSpd }
    self.pressingDown = false
  }
  return self
}

module.exports.Create = CreatePlayer
