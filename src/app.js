const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const user = require("./models/user");

const app = express();
const port = 3000;

app.use(express.json());

app.post("/signup", async (req, res) => {
    const user = new User(req.body);

    try{
        await user.save();
        res.send("User added Successfully");
    } catch (err) {
        res.send(400).send("Error saving the user: " + err.message);
    }
});

app.get("/user", async(req, res) => {
    const userEmail = req.body.emailId;

    try{
        const users = await User.find({emailId: userEmail});
        if(users.length === 0){
            res.send(404).send("User not found");
        } else {
            res.send(users);
        }
    }catch(err) {
        res.send(400).send("Error getting the user: " + err.message);
    }
});

app.get("/feed", async(req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    } catch(err) {
        res.send(400).send("Error getting the user: " + err.message);
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

