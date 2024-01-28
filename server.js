// Imports
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Set up express app
const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cors());
const port = 8000;

const authChecker = function (req, res, next) {
    if(req.path != "/login" && req.body.uid == -1) {
        res.redirect("/login");
    }
    next();
};

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
          
// Endpoint to return the data of a single post
app.get("/post", function(req, res) {
    pool.query(
        'SELECT p.title, p.body AS post_body, u.username AS post_username, c.comment_id, c.body AS comment_body, cu.username AS comment_username FROM post p LEFT JOIN comment c ON p.post_id = c.post_id JOIN user u ON p.user_id = u.user_id JOIN user cu ON c.user_id = cu.user_id WHERE p.post_id = ?;',
        [req.query.id], 
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

app.get("/posts", function (req, res) {
    if (req.query.current == -1) {
        console.log('requested newest posts');
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id ORDER BY post.post_id DESC LIMIT 5;',
            [req.query.limit],
            (error, results) => {
                console.log(req.query.limit);
                console.log(results);
                if (error) {
                    res.status(500);
                }
                else {
                    res.status(200).json(results);
                }
            }
        );
    } else {
        console.log('requested more posts');
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post_id < ? ORDER BY post.post_id DESC LIMIT 5;',
            [req.query.current, req.query.limit],
            (error, results) => {
                console.log(req.query.current, req.query.limit)
                console.log(results);
                if (error) {
                    res.status(500);
                }
                else {
                    res.status(200).json(results);
                }
            }
        );
    }
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

//Handles user Post request
app.post('/post', function (req, res) {  
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO post (user_id, title, body) VALUES (?, ?, ?)",
        [user_id, req.body.title, req.body.body],
        (error, results) => {
            if (error) {
                res.status(500).send("Error creating a new post");
            } else {
                res.status(200).json({ post_id: results.insertId });
            }
        }

    );
});

//Handles user Comment request
app.post('/comment', function (req, res) {  
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO comment (body, post_id, user_id) VALUES (?, ?, ?)",
        [req.body.body, req.body.post_id, user_id],
        (error, results) => {
            if (error) {
                res.status(500).send("Error creating a new comment");
            } else {
                res.status(200).json({ comment_id: results.insertId });
            }
        }

    );

app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
