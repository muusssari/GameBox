
const CreateLobby = function(id) {
    let self = {
        id: id,
        game: false,
        players: []
    }
    self.AddPlayer = function (player) {
        self.players.push(player);
        player.lobby = self.id;
    }
    return self;
}

module.exports.creteLobby = CreateLobby;