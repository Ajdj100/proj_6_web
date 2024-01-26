// Imports
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

// Set up express app
const app = express();
const port = 8000;

const connLimit = 100;

const pool = mysql.createPool({
    host : process.env.HOST,
    user : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
    port : 3306,
    connectionLimit : connLimit,
    enableKeepAlive : true,
    waitForConnections : true,
    idleTimeout : 60000
});

// Server routes
app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/testquery", function(req, res) {
    pool.query('SELECT * FROM user;', function (error, results, fields) {
        if (error) throw error;
        for (let user in results) {
            console.log(user.username);
            console.log(user.password)
        }
    });
});

app.post("/login", function(req, res) {
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
