const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

const USER_SHARABLE_DATA = "firstName lastName imageUrl age gender skills";

userRouter.get("/user/requests/received", userAuth, async(req, res) => {
    try{
        const loggedInUser = req.user;
        const pendingRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id, 
            status: "interested"
        }).populate("fromUserId", USER_SHARABLE_DATA);

        res.json({message: "Data fetched successfully", data: pendingRequests});

    } catch(err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

userRouter.get("/user/connections", userAuth, async(req, res) => {
    try{
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { 
                    toUserId: loggedInUser._id, 
                    status: "accepted"
                },
                { 
                    fromUserId: loggedInUser._id, 
                    status: "accepted"
                },
            ]
        }).populate("toUserId", USER_SHARABLE_DATA);

        const data = connections.map(connection => connection.fromUserId);
        res.json({message: "Data fetched successfully", data});

    } catch(err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = userRouter;