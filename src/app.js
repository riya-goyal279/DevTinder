const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData, validateLoginData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
    
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

app.post("/login", async (req, res) => {
    
    try{
        const { password, emailId } = req.body;

        const user = await User.findOne({emailId: emailId});

        if(!user) {
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid){
            const token = await jwt.sign({_id: user._id}, "DEV@Tinder$279");
            
            res.cookie("token", token);
            res.send("Login Successful !!!");
        }
        else 
            throw new Error("Invalid Credentials");

    } catch (err) {
        res.status(400).send("Error : " + err.message);
    }
});

app.get("/profile", userAuth , async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    } catch(err) {
        res.status(400).send("User not logged in: " + err.message);
    }
});

app.get("/user", async(req, res) => {
    const userEmail = req.body.emailId;

    try{
        const users = await User.find({emailId: userEmail});
        if(users.length === 0){
            res.status(404).send("User not found");
        } else {
            res.send(users);
        }
    }catch(err) {
        res.status(400).send("Error getting the user: " + err.message);
    }
});

app.get("/feed", async(req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    } catch(err) {
        res.status(400).send("Error getting the user: " + err.message);
    }
});

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const newData = req.body;

    try {
        const ALLOWED_UPDATES = ["imageUrl", "about", "gender", "age", "skills"];

        const isUpdateAllowed = Object.keys(newData).every((k) => ALLOWED_UPDATES.includes(k));
        if(!isUpdateAllowed) 
            res.status(400).send("Update not allowed");

        await User.findByIdAndUpdate({_id: userId}, newData, { runValidators: true });
        res.send("User updated successfully");
    } catch(err) {
        res.status(400).send("Error getting the user: " + err.message);
    }
})

connectDB()
    .then(() => {
        console.log("Database connection established...");
        app.listen(port, () => {
            console.log(`Server is successfully listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected!");
    })

