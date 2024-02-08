// Contains all /profile routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

router.get("/", function (req, res) {
    console.log(`METHOD: ${req.method}`);
    pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post.user_id = (?);',
        [req.cookies.current_user],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500
                res.status(status);
            }
            else {
                status = 200;
                res.status(status).json(results);
            }
            console.log(`RES: ${status}`);
        }
    );
});

module.exports = router;