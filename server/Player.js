
const CreatePlayer = function(id,cell) {
    let self = {
        x:10,
        y:30,
        id:id,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:40,
        currentCell:cell,
        isReady:false,
        inLobby: false,
        inGame: false,
    }
    self.updatePosition = function() {
        if(self.pressingRight)
            self.x += self.maxSpd;
            self.pressingRight = false;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
            self.pressingLeft = false;
        if(self.pressingUp)
            self.y -= self.maxSpd;
            self.pressingUp = false;
        if(self.pressingDown)
            self.y += self.maxSpd;
            self.pressingDown = false;
    }
    return self;
}

module.exports.Create = CreatePlayer;