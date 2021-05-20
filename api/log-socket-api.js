const { logEvent } = require("./game-api");

const logSocketAPI = (io, socket) => {
    socket.on("logEvent", (eventMessage) => {
        io.emit("eventLogged", eventMessage);
    });

    socket.on("sendGlobalMessage", async (gameID, message, playerName) => {
        let logged = await logEvent(gameID, message, playerName);
        io.emit("eventLogged", logged);
    });
}

module.exports = { logSocketAPI };
