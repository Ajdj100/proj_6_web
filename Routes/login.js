// Contains all /login routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

// Endpoint to verify user login credentials
router.post("/", function(req, res) {
    console.log(`METHOD: ${req.method}`);
    pool.query(
        'SELECT user_id from user WHERE username = ? AND password = ?;',
        [req.body.username, req.body.password], 
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status);
            }
            else if (!results.length) {
                status = 401;
                res.status(status).send("Invalid credentials");
            }
            else {
                res.cookie("current_user", results[0])
                status = 200
                res.status(status).json(results[0]);
            }
            console.log(`RES: ${status}`);
        }
    );
});

module.exports = router;