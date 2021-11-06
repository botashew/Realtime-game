const tiles = Array.from(document.querySelectorAll('.tile'))
const playersList = document.querySelector('.players')
const announcer = document.querySelector('.announcer')
const resetBtn = document.getElementById('reset')
const socket = io()

// Get room
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Join game room
socket.emit('joinRoom', {username, room})

// Get room and players
socket.on('roomPlayers', ({ players, room }) => {
    outputPlayerName(players)
})

// DOM Manipulation
function outputPlayerName(players){
    playersList.innerHTML = `
        ${players.map((player, index) => {
            if(index === 0){
                return `<p class="display-player playerX-color playerX">${player.username}</p>`
            }
            if(index === 1){
                return `<p class="display-player playerO-color">${player.username}</p>`
            }
        }).join('')}
    `
}

let board = ['', '', '', '', '', '', '', '', '']
let currentPlayer = 'X'
let isGameActive = true
let currentPlayerDisplay = 0

const playerX_won = 'playerX_won'
const playerO_won = 'playerO_won'
const tie = 'Tie!'

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

// Methods
const announce = (type, player) => {
    switch(type){
        case playerO_won:
            announcer.innerHTML = `<span class="player${player.status}-color">${player.username}</span> победил(а)!`
            break
        case playerX_won:
            announcer.innerHTML = `<span class="player${player.status}-color">${player.username}</span> победил(а)!`
            break
        case tie:
            announcer.innerText = 'Ничья'
    }
    announcer.classList.remove('hide')
}

const handleResultValidation = (player) => {
    let roundWon = false
    for (let i = 0; i<=7; i++){
        const winCondition = winningConditions[i]
        const a = board[winCondition[0]]
        const b = board[winCondition[1]]
        const c = board[winCondition[2]]
        if(a === '' || b === '' || c === ''){
            continue
        }
        if(a === b && b === c){
            roundWon = true
            break
        }
    }

    if(roundWon){
        announce(player.status === 'X' ? playerX_won : playerO_won, player)
        isGameActive = false
        return
    }

    if(!board.includes('')){
        announce(tie)
    }

}

const changePlayer = (player) => {
    const playerX = document.querySelector(".playerX-color")
    const playerO = document.querySelector(".playerO-color")
    if(player.status === 'X'){
        playerX.classList.remove('playerX')
        playerO.classList.add('playerO')
    }
    if(player.status === 'O'){
        playerO.classList.remove('playerO')
        playerX.classList.add('playerX')
    }
}

const updateBoard = (index, playerStatus) => {
    board[index] = playerStatus
}

const isValidAction = (tile) => {
    if(tile.innerText === 'X' || tile.innerText === 'O'){
        return false
    }
    return true
}

// Which Player is Active
function isPlayerActive(player){
    // Select Player Elements
    const playerX = document.querySelector(".playerX-color")
    const playerO = document.querySelector(".playerO-color")

    if(playerX.classList.contains(`player${player.status}`)){
        return true
    }
    if(playerO.classList.contains(`player${player.status}`)){
        return true
    }
    return false
}

const userAction = (player, index) => {
    if(isValidAction(tiles[index]) && isGameActive && isPlayerActive(player)){
        tiles[index].innerText = player.status
        tiles[index].classList.add(`player${player.status}-color`)
        updateBoard(index, player.status)
        changePlayer(player)
        handleResultValidation(player)
    }
}

// Reset Method
function resetBoard(player){
    const playerX = document.querySelector('.playerX-color')
    const playerO = document.querySelector('.playerO-color')
    board = ['', '', '', '', '', '', '', '', '']
    isGameActive = true
    announcer.classList.add('hide')
    
    // PlayerX Resets
    if(player.status === 'X'){
        playerO.classList.remove('playerO')
        playerX.classList.add('playerX')
    }

    // PlayerO Resets
    if(player.status === 'O'){
        changePlayer(player)
    }

    tiles.forEach(tile => {
        tile.innerText = ''
        tile.classList.remove('playerX-color')
        tile.classList.remove('playerO-color')
    })
}

// Play Action
socket.on('playAction', (player, index) => {
    userAction(player, index)
})

// Reset Game
socket.on('resetGame', player => {
    resetBoard(player)
})

// Events
tiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
            socket.emit('play', index)
        }
    )
})

resetBtn.addEventListener('click', () => {
    socket.emit('reset')
})
