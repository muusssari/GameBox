
const CreateLobby = function (id) {
  const self = {
    id: id,
    game: false,
    players: [],
    maze: []
  }
  self.AddPlayer = function (player) {
    self.players.push(player)
  }
  return self
}

module.exports.creteLobby = CreateLobby
