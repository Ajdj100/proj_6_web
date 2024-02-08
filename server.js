// Imports
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Set up express app
const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cors());
app.use(cookieParser());

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Cookie');
        return res.sendStatus(200);
    }
    next();
});
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
                res.cookie("current_user", results[0])
                res.status(200).json(results[0]);
            }
        }
    );
});
          
// Endpoint to return the data of a single post
app.get("/post", function(req, res) {
    console.log("Post ID:", req.query.id);
    
    pool.query('SELECT p.post_id, p.title, p.body AS post_body, u.username AS post_username, c.comment_id, IFNULL(c.body, "") AS comment_body, IFNULL(cu.username, "") AS comment_username FROM post p LEFT JOIN comment c ON p.post_id = c.post_id JOIN user u ON p.user_id = u.user_id LEFT JOIN user cu ON c.user_id = cu.user_id WHERE p.post_id = ?;',
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

app.get("/username", function(req, res) {
    pool.query('SELECT username FROM user WHERE user_id=?;',
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
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id ORDER BY post.post_id DESC LIMIT 10;',
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

app.get('/article', function(req, res) {
    res.sendFile(__dirname + "/public/Article.html");
})

//Handles user Signup Post request
app.post('/signup', function (req, res) {  
    pool.query(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [req.body.username, req.body.password],
        (error, results) => {
            if (error) {
                res.status(500).send("Error Signing up a user");
            } else {
                res.cookie("current_user", results.insertId);
                res.status(200).json(results.insertId);
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
});


app.get("/profile", function (req, res) {

    pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post.user_id = (?);', 
    [req.cookies.current_user],
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

//Handle navigation to edit post page
app.get('/editpost', function(req, res) {

    res.sendFile(__dirname + "/public/editpost.html");
});

//Handling the edit post 
app.patch('/patch', function(req, res) {
       
    let query;
    let values = [];
    let post_id = req.body.post_id;

    // We Patching both title and Body
    if (req.body.title && req.body.body) {
        query = 'UPDATE post SET title = ?, body = ? WHERE post_id = ?';
        values = [req.body.title, req.body.body, req.body.post_id];
    // We Patching only Title
    } else if (req.body.title) {
        query = 'UPDATE post SET title = ? WHERE post_id = ?';
        values = [req.body.title, req.body.post_id];

    // We Patching only Body
    } else if (req.body.body) {
        query = 'UPDATE post SET body = ? WHERE post_id = ?';
        values = [req.body.body, req.body.post_id];
    }

   // Execute based on the different scenario
   pool.query(query, values, (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Error updating the post.' });

            } else {
                res.status(200).json({ message: 'Post updated successfully.' });

            }
        }
    )
});

//Handling the edit comment 
app.patch('/comment', function(req, res) {
    
    pool.query(
        'UPDATE comment SET body = ? WHERE comment_id = ? AND post_id = ?', 
        [req.body.body, req.body.comment_id, req.body.post],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Error updating the comment.' });
            } else {
                res.status(200).json({ message: 'Comment updated successfully.' });
            }
        }
    )
});



app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
