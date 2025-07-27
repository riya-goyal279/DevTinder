const express = require("express");

const app = express();
const port = 3000;

app.use("/server", (req, res) => {
    res.send("Hello from the server");
});

app.use("/test", (req, res) => {
    res.send("Hare Krishna");
});

app.listen(port, () => {
    console.log(`Server is successfully listening on port ${port}`);
});