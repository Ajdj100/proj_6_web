// Contains all /posts routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

router.get("/", function (req, res) {
    if (req.query.current == -1) {
        console.log('requested newest posts');
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id ORDER BY post.post_id DESC LIMIT 10;',
            [req.query.limit],
            (error, results) => {
                console.log(req.query.limit);
                console.log(results);
                if (error) {
                    res.status(500);
                }
                else {
                    res.status(200).json(results);
                }
            }
        );
    } else {
        console.log('requested more posts');
        pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post_id < ? ORDER BY post.post_id DESC LIMIT 5;',
            [req.query.current, req.query.limit],
            (error, results) => {
                console.log(req.query.current, req.query.limit)
                console.log(results);
                if (error) {
                    res.status(500);
                }
                else {
                    res.status(200).json(results);
                }
            }
        );
    }
});

module.exports = router;