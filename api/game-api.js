const { Games } = require("../models/Games");

// generate empty game board
let defaultGrid = [];
[...Array(3)].forEach((_, i) => {
    let newRow = ["", "", ""];
    defaultGrid.push(newRow);
});

const checkWin = (curValues, player) => {
    // row check
    for (let i = 0; i < 3; ++i) {
        let row = curValues[i];
        if (row.every(val => val === player)) return true;
    }

    // column check
    for (let j = 0; j < 3; ++j) {
        let col = [curValues[0][j], curValues[1][j], curValues[2][j]];
        if (col.every(val => val === player)) return true;
    }

    // diagonal check
    let diag1 = [curValues[0][0], curValues[1][1], curValues[2][2]];
    let diag2 = [curValues[0][2], curValues[1][1], curValues[2][0]];
    if (diag1.every(val => val === player)) return true;
    if (diag2.every(val => val === player)) return true;

    return false;
}

const checkDraw = (curValues) => {
    // assuming there's no win con on the board
    for (let i = 0; i < 3; ++i) {
        let row = curValues[i];
        if (row.includes("")) return false;
    }

    return true;
}

const createGame = async (playerName) => {
    try {
        // generate ID to join course for students
        let joinID = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('');
        joinID = joinID.toUpperCase();

        const game = new Games({
            joinID,
            active: true,
            board: defaultGrid,
            turnNumber: 1,
            gameNumber: 1,
            gameWon: false,
            gameDrawn: false,
            winner: "",
            player1: {
                name: playerName,
                symbol: "X",
                wins: 0,
                draws: 0,
                losses: 0
            },
            player2: null,
            currentPlayer: {
                name: playerName,
                symbol: "X"
            },
            logs: [{ content: `${playerName} joined the lobby.`, author: 'SYSTEM' }]
        });
        const savedGame = await game.save();
        return savedGame;
    } catch (err) {
        return { error: err };
    }
}

const logEvent = async (gameID, content, author) => {
    try {
        const game = await Games.findById(gameID);
        if (!game) {
            return { error: "No game found with that ID" };
        } 
        const updatedGame = await Games.findByIdAndUpdate(gameID, 
            { $set: { logs: [...game.logs, { content, author }] }},
            { new: true }
        )
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

const joinGame = async (joinID, playerName) => {
    try {
        const game = await Games.findOne({ joinID });
        if (!game) {
            return { error: "Invalid game ID" };
        }
        const { player1, player2 } = game;

        // make sure there's a player slot available
        if (player1.name && player2.name) {
            return { error: "That lobby is already full, try spectating instead" };
        }
        // make sure name is unique within the game
        if (player1.name && player1.name === playerName) {
            return { error: "User with that name is already in the lobby" };
        }
        if (player2.name && player2.name === playerName) {
            return { error: "User with that name is already in the lobby" };
        }

        let updatedGame;
        let newPlayer = {
            name: playerName,
            symbol: "",
            wins: 0,
            draws: 0,
            losses: 0
        }
        if (!player1.name) {
            newPlayer.symbol = "X";
            updatedGame = await Games.findByIdAndUpdate(game._id,
                { $set: { 
                    player1: newPlayer,

                }},
                { new: true }
            )
        } else {
            newPlayer.symbol = "O";
            updatedGame = await Games.findByIdAndUpdate(game._id,
                { $set: { player2: newPlayer }},
                { new: true }
            )
        }
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

const leaveGame = async (gameID, playerName) => {
    try {
        const game = await Games.findById(gameID);
        if (!game) {
            return { error: "No game found with that ID" };
        }
        let updatedGame;
        if (game.player1 && game.player1.name === playerName) {
            updatedGame = await Games.findByIdAndUpdate(gameID,
                { $set: { player1: null }},
                { new: true }
            )
        } else if (game.player2 && game.player2.name === playerName) {
            updatedGame = await Games.findByIdAndUpdate(gameID,
                { $set: { player2: null }},
                { new: true }
            )
        } else {
            return { error: "No player found with that name" };
        }
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

const makeMove = async (gameID, index, symbol) => {
    try {
        const game = await Games.findById(gameID);
        if (!game) {
            return  { error: "No game found with that ID" };
        }

        // make move if possible
        const rowIdx = Math.floor(index / 3);
        const colIdx = index % 3;
        let newValues = [...game.board];

        if (newValues[rowIdx][colIdx] === "") {
            newValues[rowIdx][colIdx] = symbol;

            let [win, draw, winner] = [false, false, ""];
            if (checkWin(newValues, symbol)) {
                win = true;
                winner = game.currentPlayer.name;
            } else if (checkDraw(newValues)) {
                draw = true;
            }

            const nextTurnNumber = game.turnNumber + 1;
            const nextPlayer = (nextTurnNumber + game.gameNumber) % 2 === 0 ? game.player1 : game.player2;
            // change board, turn number and current player
            const updatedGame = await Games.findByIdAndUpdate(gameID,
                { $set: 
                    {
                        board: newValues,
                        turnNumber: nextTurnNumber,
                        gameWon: win,
                        gameDrawn: draw,
                        winner: winner,
                        currentPlayer: {
                            name: nextPlayer.name,
                            symbol: nextPlayer.symbol
                        }
                    } 
                },
                { new: true }    
            )
            return updatedGame;
        }
        return { error: "That space is already occupied" };
        
    } catch (err) {
        return { error: err };
    }
}

// const incrementTurnCount = async (gameID) => {
//     try {
//         const game = await Games.findById(gameID);
//         const updatedGame = await Games.findByIdAndUpdate(gameID,
//             { $set: { turnNumber: game.turnNumber + 1 } },
//             { new: true }    
//         )
//         return updatedGame;
//     } catch (err) {
//         return { error: err };
//     }
// }
const incrementPlayerDraw = async (gameID) => {
    try {
        const game = await Games.findById(gameID);
        if (!game) {
            return { error: "No game with that ID found" };
        }

        let updatedP1 = { ...game.player1, draws: game.player1.draws + 1 };
        let updatedP2 = { ...game.player2, draws: game.player2.draws + 1 };

        const updatedGame = await Games.findByIdAndUpdate(gameID,
            { $set: { 
                player1: updatedP1,
                player2: updatedP2 
            } },
            { new: true }    
        )
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

const incrementPlayerWin = async (gameID, playerName) => {
    try {
        const game = await Games.findById(gameID);
        let updatedP1, updatedP2;
        if (!game) {
            return { error: "No game with that ID found" };
        }
        if (game.player1.name === playerName) {
            updatedP1 = { ...game.player1, wins: game.player1.wins + 1 };
            updatedP2 = { ...game.player2, losses: game.player2.losses + 1 };
        } else if (game.player2.name === playerName) {
            updatedP1 = { ...game.player1, losses: game.player1.losses + 1 };
            updatedP2 = { ...game.player2, wins: game.player2.wins + 1 };
        } else {
            return { error: "No player with that name found" };
        }
        const updatedGame = await Games.findByIdAndUpdate(gameID,
            { $set: { 
                player1: updatedP1,
                player2: updatedP2 
            } },
            { new: true }    
        )
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

const resetGame = async (gameID) => {
    try {
        const game = await Games.findById(gameID);
        if (!game) {
            return { error: "No game found with that ID" };
        }
        const nextPlayer = (game.gameNumber) % 2 === 0 ? game.player1 : game.player2;
        const updatedGame = await Games.findByIdAndUpdate(gameID,
            { $set: {
                board: defaultGrid,
                turnNumber: 1,
                gameNumber: game.gameNumber + 1,
                gameWon: false,
                gameDrawn: false,
                winner: "",
                currentPlayer: {
                    name: nextPlayer.name,
                    symbol: nextPlayer.symbol
                }
            } },
            { new: true }    
        )
        return updatedGame;
    } catch (err) {
        return { error: err };
    }
}

module.exports = { createGame, joinGame, logEvent, leaveGame, makeMove, incrementPlayerDraw, incrementPlayerWin, resetGame };
