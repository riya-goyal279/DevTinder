const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData, validatePassword } = require("../utils/validation");
const bcrypt = require("bcrypt");

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

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try{

        const loggedInUser = req.user;
        const { oldPassword, newPassword} = req.body;

        const isPasswordValid = await loggedInUser.validatePassword(oldPassword);

        if(!isPasswordValid)
            res.status(400).json({message: "Invalid Password"});
        
        validatePassword(newPassword);

        const passwordHash = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = passwordHash;

        await loggedInUser.save();

        res.json({ message: `${loggedInUser.firstName}, your password is updated succesfully!!!`});
    } catch(err) {
        res.status(400).send("Error: " + err.message);
    }
});

module.exports = profileRouter;