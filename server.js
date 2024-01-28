// Imports
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

// Set up express app
const app = express();
app.use(express.json());
const port = 8000;

const authChecker = function (req, res, next) {
    if(req.path != "/login" && req.body.uid == -1) {
        res.redirect("/login");
    }
    next();
};

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cors());
//app.use(authChecker);

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
    res.sendFile(__dirname + "/public/Login.html");
});

app.get("/queryexample", function(req, res) {
    pool.query("SELECT * FROM user;", function (error, results, fields) {
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

app.get("/posts", function(req, res) {
    pool.query(
        'SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id=user.user_id WHERE post_id < ? LIMIT ?;',
        [req.body.lastID, req.body.limit], 
        (error, results) => {
            console.log(results);
            if (error) {
                res.status(500);
            }
            else {
                res.status(200).json(results);
            }
        }
    );
});

//Handles user Signup Post request
app.post('/signup', function (req, res) {  
    pool.query(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [req.body.username, req.body.password],
        (error, results) => {
            if (error) {
                res.status(500).send("Error Signing up a user");
            } else {
                res.status(200).json(results[0]);
            }
        }

    );
});

app.get('/browse', function(req, res) {
    res.sendFile(__dirname + "/public/Browse.html");
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
