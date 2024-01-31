// Contains all /signup routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

//Handles user Signup Post request
router.post('/', function (req, res) {  
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



module.exports = router;