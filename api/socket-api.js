const { gameSocketAPI } = require("./game-socket-api");
const { logSocketAPI } = require("./log-socket-api");

const socketAPI = (io) => {
    io.on("connection", (socket) => {
        console.log("a user connected", socket.id);

        gameSocketAPI(io, socket);
        logSocketAPI(io, socket);

        socket.on("disconnect", () => {
            console.log("a user disconnected", socket.id);
            // io.emit("temp", socketGameID, sockets[socket.id]);
        });
    });
}

module.exports = { socketAPI };