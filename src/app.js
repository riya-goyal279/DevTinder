const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
const port = 3000;

app.post("/signup", async (req, res) => {
    const user = new User({
        firstName: "Riya",
        lastName: "Goyal",
        emailId: "riya.goyal.dev@gmail.com",
        password: "riya@123",
    });

    try{
        await user.save();
        res.send("User added Successfully");
    } catch (err) {
        res.send(400).send("Error saving the user: " + err.message);
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

