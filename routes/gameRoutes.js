const express = require("express");
const { Games } = require("../models/Games");
const gameRoutes = express.Router();

const { joinGame, createGame } = require("../api/game-api");

gameRoutes.get("/GetGames", async (req, res) => {
    try {
        const games = await Games.find();
        res.json(games);
    } catch (err) {
        res.json({ error: err });
    }
});

gameRoutes.get("/GetGame/:gameID", async (req, res) => {
    try {
        const game = await Games.findById(req.params.gameID);
        res.json(game);
    } catch (err) {
        res.json({ error: err });
    }
});

gameRoutes.post("/CreateGame", async (req, res) => {
    const { playerName } = req.body;
    let game = await createGame(playerName);
    res.json(game);
});

gameRoutes.post("/JoinGame", async (req, res) => {
    const { joinID, playerName } = req.body;
    return await joinGame(joinID, playerName);
});


module.exports = gameRoutes;
