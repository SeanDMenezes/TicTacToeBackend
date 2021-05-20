const mongoose = require("mongoose");

const GamesSchema = mongoose.Schema({
    joinID: String,
    board: [[String]],
    active: String,
    turnNumber: Number,
    gameNumber: Number,
    gameWon: Boolean,
    gameDrawn: Boolean,
    winner: String,
    player1: {
        name: String,
        symbol: String,
        wins: Number,
        draws: Number,
        losses: Number
    },
    player2: {
        name: String,
        symbol: String,
        wins: Number,
        draws: Number,
        losses: Number
    },
    currentPlayer: {
        name: String,
        symbol: String
    },
    spectators: [String],
    logs: [{
        content: String,
        author: String
    }]
});

const Games = mongoose.model("Games", GamesSchema);

module.exports = { GamesSchema, Games };
