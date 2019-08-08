
const CreateLobby = function(id) {
    let self = {
        id: id,
        game: false,
        players: [],
        maze:[]
    }
    self.AddPlayer = function (player) {
        self.players.push(player);
    }
    return self;
}

module.exports.creteLobby = CreateLobby;