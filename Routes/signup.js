// Contains all /signup routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

//Handles user Signup Post request
router.post('/', function (req, res) {  
    console.log(`METHOD: ${req.method}`);
    pool.query(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [req.body.username, req.body.password],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status).send("Error Signing up a user");
            } else {
                res.cookie("current_user", results.insertId);
                status = 200;
                res.status(status).json(results.insertId);
            }
            console.log(`RES: ${status}`);
        }

    );
});

module.exports = router;