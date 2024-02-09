const cluster = require('cluster');

// Fork cluster based on available CPU cores.
if (cluster.isMaster) {
    const cpuCount = require('os').availableParallelism();
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
} else {
    // Imports
    const express = require('express');
    const mysql = require('mysql2');
    const cors = require('cors');
    const cookieParser = require('cookie-parser');
    require('dotenv').config({ override: true })

    // Set up express app
    const app = express();
    app.use(express.json());
    app.use(express.static(__dirname + "/Public"));
    app.use(cors());
    app.use(cookieParser());

    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            console.log(`METHOD: ${req.method}`);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Cookie');
            const status = 200;
            console.log(`RES: ${status}`);
            return res.sendStatus(status);
        }
        next();
    });
    const port = 8000;

    const authChecker = function (req, res, next) {
        const authCookie = req.cookies.current_user;
        console.log("--------");
        console.log(`USER ID: ${authCookie}`);
        console.log(`REQ: ${req.path}`);
        if (!authCookie && req.path != "/" && req.path != "/login" && req.path != "/signup" && req.path != "/favicon.ico") {
            const status = 401;
            console.log(`RES: ${status}`);
            res.status(status).send("Authentication required.");
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

    // Server routes
    app.get("/", function (req, res) {
        console.log(`METHOD: ${req.method}`);
        let sendPage = "/Public/Login.html";
        res.sendFile(__dirname + sendPage);
        console.log(`SERVE: ${sendPage}`);
        const status = 200;
        console.log(`RES: ${status}`);
    });

    app.get('/article', function (req, res) {
        console.log(`METHOD: ${req.method}`);
        let articlePage = "/Public/Article.html";
        res.sendFile(__dirname + articlePage);
        console.log(`SERVE: ${articlePage}`);
        const status = 200;
        console.log(`RES: ${status}`);
    });

    app.get('/browse', function (req, res) {
        console.log(`METHOD: ${req.method}`);
        let browsePage = "/Public/Browse.html";
        res.sendFile(__dirname + browsePage);
        console.log(`SERVE: ${browsePage}`);
        const status = 200;
        console.log(`RES: ${status}`);
    });

    //Handle navigation to edit post page
    app.get('/editpost', function (req, res) {

        res.sendFile(__dirname + "/public/editpost.html");
    });

    //Handling the edit post
    app.patch('/patch', function (req, res) {

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
        })
    });

    app.listen(port, function () {
        let address = `http://localhost:${port}`;
        console.log(`Listening on ${address}`);
    });
}
