var express = require('express'),
    router = express.Router();

const pool = require('../server.js').pool;


router.post("/", function (req, res) {
    pool.query('SELECT * FROM user;', function (error, results, fields) {
        if (error) throw error;
        for (let user in results) {
            console.log(user.username);
            console.log(user.password)
        }
    });
});

module.exports = router;