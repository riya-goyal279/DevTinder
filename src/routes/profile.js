const express = require("express");
const { userAuth } = require("../middlewares/auth");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth , async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    } catch(err) {
        res.status(400).send("User not logged in: " + err.message);
    }
});

module.exports = profileRouter;