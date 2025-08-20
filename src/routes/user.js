const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
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
        })
        .populate("fromUserId", USER_SHARABLE_DATA)
        .populate("toUserId", USER_SHARABLE_DATA);

        const data = connections.map(connection => {
            if(connection.fromUserId._id.toString() === loggedInUser._id.toString())
                return connection.toUserId;
            else 
                return connection.fromUserId;
        });
        res.json({message: "Data fetched successfully", data});

    } catch(err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

userRouter.get("/user/feed", userAuth, async(req, res) => {
    try{
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        limit = limit > 50 ? 50 : limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId);
            hideUsersFromFeed.add(req.toUserId);
        });

        const users = await User.find({
            $and: [
                {_id: { $nin: Array.from(hideUsersFromFeed)}},
                {_id: {$ne: loggedInUser._id}}
            ]
        }).select(USER_SHARABLE_DATA).skip(skip).limit(limit);

        res.json({data: users});

    } catch(err) {
        res.status(400).send({message: `ERROR: ${err.message}`});
    }
});

module.exports = userRouter;