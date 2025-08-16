const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", userAuth, async(req, res) => {
    const user = req.user;

    res.send(user.firstName + "sent the connection request!");
});

module.exports = requestsRouter;