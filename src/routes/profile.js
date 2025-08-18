const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth , async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    } catch(err) {
        res.status(400).send("Error: " + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try{
        if(!validateEditProfileData(req))
            throw new Error("Invalid Edit Request");
        
        const loggedInUser = req.user;
        const updatedUser = req.body;

        Object.keys(updatedUser).forEach((key) => loggedInUser[key] = updatedUser[key]);

        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName}, your profile is updated succesfully!!!`,
            data: loggedInUser
        })
    } catch(err) {
        res.status(400).send("Error: " + err.message);
    }
});

module.exports = profileRouter;