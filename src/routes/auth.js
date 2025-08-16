const express = require("express");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const appRouter = express.Router();

appRouter.post("/signup", async (req, res) => {
    try{
        validateSignUpData(req);

        const { password, firstName, lastName, emailId } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName, 
            lastName,   
            emailId, 
            password: passwordHash
        });

        await user.save();
        res.send("User added Successfully");
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
});

appRouter.post("/login", async (req, res) => {
    
    try{
        const { password, emailId } = req.body;

        const user = await User.findOne({emailId: emailId});

        if(!user) {
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){
            const token = await user.getJWT();
            
            res.cookie("token", token);
            res.send("Login Successful !!!");
        }
        else 
            throw new Error("Invalid Credentials");

    } catch (err) {
        res.status(400).send("Error : " + err.message);
    }
});

appRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, { expires: new Date(Date.now()) })
        .send("Logout Successful !!!");
});

module.exports = appRouter;