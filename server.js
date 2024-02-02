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

//wtf is this even used for
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


app.get('/article', function (req, res) {
    res.sendFile(__dirname + "/public/Article.html");
})


app.get('/browse', function(req, res) {
    res.sendFile(__dirname + "/public/Browse.html");
});


app.listen(port, function () {
    console.log(`Listening on port ${port}!`);
});
