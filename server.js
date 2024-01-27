// Imports
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

// Set up express app
const app = express();
app.use(express.json());
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
        // Write specific element from log
        results.forEach( element => {
            console.log(element.username);
        });
        // Return results in res
        res.status(200).json({user: results})
    });
});

// Endpoint to verify user login credentials
app.post("/login", function(req, res) {
    pool.query(
        'SELECT user_id from user WHERE username = ? AND password = ?;',
        [req.body.username, req.body.password], 
        (error, results) => {
            console.log(results);
            if (error) {
                res.status(500);
            }
            else if (!results.length) {
                res.status(401).send("Invalid credentials");
            }
            else {
                res.status(200).json(results[0]);
            }
        }
    );
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
