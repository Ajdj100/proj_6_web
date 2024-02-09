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
    const authCookie = req.cookies.current_user;
    console.log(authCookie);
    console.log(req.path);
    if (!authCookie && req.path != "/" && req.path != "/login" && req.path != "/signup" && req.path != "/favicon.ico") {
        res.status(401).send("Authentication required.");
    } else {
        next();
    }
};

app.use(authChecker);

const connLimit = 100;

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
    connectionLimit: connLimit,
    enableKeepAlive: true,
    waitForConnections: true,
    idleTimeout: 60000
});

module.exports.pool = pool;

const postRoutes = require('./Routes/post');
const commentRoutes = require('./Routes/comment');
const postsRoutes = require('./Routes/posts');
const loginRoutes = require('./Routes/login');  //idk why this has an error, but the error doesnt actually exist
const signUpRoutes = require('./Routes/signup');
const profileRoutes = require('./Routes/profile');
// const signUpRoutes = require('./Routes/Signup');

app.use('/post', postRoutes);
app.use('/comment', commentRoutes);
app.use('/posts', postsRoutes);
app.use('/login', loginRoutes);
app.use('/signup', signUpRoutes);
app.use('/profile', profileRoutes);
// app.use('/signup', signUpRoutes);


// Server routes
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/Login.html");
});

app.get('/article', function (req, res) {
    res.sendFile(__dirname + "/public/Article.html");
})


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
