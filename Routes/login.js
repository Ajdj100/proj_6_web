// Contains all /login routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;


// Endpoint to verify user login credentials
router.post("/", function(req, res) {
    pool.query(
        'SELECT user_id from user WHERE username = ? AND password = ?;',
        [req.body.username, req.body.password], 
        (error, results) => {
            console.log(results);
            if (error) {
                res.status(500);
                console.log(error);
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


module.exports = router;