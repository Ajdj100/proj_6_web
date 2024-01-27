// Imports
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

// Set up express app
const app = express();
const port = 8000;

const authChecker = function (req, res, next) {
    if(req.path != '/login' && req.body.uid == -1) {
        res.redirect('/login');
    }
    next();
};

app.use(express.json());
app.use(authChecker);

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

app.get("/queryexample", function(req, res) {
    pool.query('SELECT * FROM user;', function (error, results, fields) {
        if (error) throw error;
        // Write all results to console
        console.log(results)
        // Write specific element from log
        results.forEach( element => {
            console.log(element.username);
        });
        // Return results in res
        res.status(200).json({user: results})
    });
});

app.post("/login", function(req, res) {
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
