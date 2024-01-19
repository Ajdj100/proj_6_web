const express = require('express');
const app = express();
const port = 8000;

// Server routes
app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.post("/", function (req, res) {
    res.send("Hello World!");
});

app.put("/", function (req, res) {
    res.send("Hello World!");
});

app.patch("/", function (req, res) {
    res.send("Hello World!");
});

app.delete("/", function (req, res) {
    res.send("Hello World!");
});

app.options("/", function (req, res) {
    res.send("Hello World!");
});


app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});