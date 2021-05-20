const { createGame, joinGame, logEvent, leaveGame, makeMove, incrementPlayerDraw, incrementPlayerWin, resetGame } = require("../api/game-api");

const gameSocketAPI = (io, socket) => {
    socket.on("startGame", async (gameID, playerName) => {
    });

    socket.on("joinGame", async (joinID, playerName) => {
        let res = await joinGame(joinID, playerName);
        let logged = await logEvent(res._id, `${playerName} joined the lobby.`, 'SYSTEM');
        io.emit("playerJoined", logged);
    });

    socket.on("leaveGame", async (gameID, playerName) => {
        let res = await leaveGame(gameID, playerName);
        io.emit("playerLeft", res);
    });

    socket.on("makeMove", async (gameID, index, symbol) => {
        let res = await makeMove(gameID, index, symbol);
        if (res && !res.error) {
            io.emit("moveMade", res);
        }
    });

    socket.on("gameWon", async (gameID, playerName) => {
        let res = await incrementPlayerWin(gameID, playerName);
        let logged = await logEvent(res._id, `${playerName} won game ${res.gameNumber}.`, 'SYSTEM');
        io.emit("gameUpdated", logged, playerName);
    });

    socket.on("gameDrawn", async (gameID) => {
        let res = await incrementPlayerDraw(gameID);
        let logged = await logEvent(res._id, `Game ${res.gameNumber} ended in a draw.`, 'SYSTEM');
        io.emit("gameUpdated", logged, "");
    });

    socket.on("reset", async (gameID) => {
        let res = await resetGame(gameID);
        let logged = await logEvent(res._id, `Game ${res.gameNumber} has started.`, 'SYSTEM');
        io.emit("gameReset", logged);
    });

    // logSocketAPI(io, socket);
}

module.exports = { gameSocketAPI };