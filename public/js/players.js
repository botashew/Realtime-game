const players = []

// Join player to game
function playerJoin(id, username, room){
    const status = playerTurn()
    const player = { id, username, room, status }
    players.push(player)
    return player
}

// Current Player
function playerTurn(){
    if(players.length % 2 === 0){
        return 'X'
    }
    else{
        return 'O'
    }
}

// Get current player
function getCurrentPlayer(id){
    return players.find(player => player.id === id)
}

// Get room players
function getRoomPlayers(room){
    return players.filter(player => player.room === room)
}

// Player leaves
function playerLeave(id){
    const index = players.findIndex(player => player.id === id)

    if(index != -1){
        return players.splice(index, 1)[0]
    }
}

module.exports = {playerJoin, getCurrentPlayer, getRoomPlayers, playerLeave}