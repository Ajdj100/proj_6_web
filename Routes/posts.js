// Contains all /posts routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

router.get("/", function (req, res) {
    console.log(`METHOD: ${req.method}`);
    if (req.query.current == -1) {
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id ORDER BY post.post_id DESC LIMIT 10;',
            [req.query.limit],
            (error, results) => {
                console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
                console.log(`QUERY LIMIT: ${req.query.limit}`);
                let status = 0;
                if (error) {
                    status = 500
                    res.status(status);
                }
                else {
                    status = 200
                    res.status(status).json(results);
                }
                console.log(`RES: ${status}`);
            }
        );
    } else {
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post_id < ? ORDER BY post.post_id DESC LIMIT 5;',
            [req.query.current, req.query.limit],
            (error, results) => {
                console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
                console.log(`QUERY LIMIT: ${req.query.limit}`);
                let status = 0;
                if (error) {
                    status = 500;
                    res.status(status);
                }
                else {
                    status = 200;
                    res.status(status).json(results);
                }
                console.log(`RES: ${status}`);
            }
        );
    }
});

module.exports = router;