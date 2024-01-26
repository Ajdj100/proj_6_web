const express = require('express');
const app = express();
const port = 8000;

<<<<<<< Updated upstream
=======
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

const loginRoutes = require('./Routes/Login');
const signUpRoutes = require('./Routes/Signup');

app.use('/login', loginRoutes);
app.use('/signup', signUpRoutes);



>>>>>>> Stashed changes
// Server routes
app.get("/", function (req, res) {
    res.send("Hello World!");
});

<<<<<<< Updated upstream
app.post("/", function (req, res) {
    res.send("Hello World!");
});

app.put("/", function (req, res) {
    res.send("Hello World!");
});
=======
app.get("/testquery", function (req, res) {
    pool.query('SELECT * FROM user;', function (error, results, fields) {
        if (error) throw error;
        for (let user in results) {
            console.log(user.username);
            console.log(user.password)
        }
    });
});

>>>>>>> Stashed changes

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