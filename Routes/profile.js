// Contains all /profile routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;


router.get("/", function (req, res) {

    pool.query('SELECT username, post_id, title, body FROM post INNER JOIN user ON post.user_id = user.user_id WHERE post.user_id = (?);',
        [req.cookies.current_user],
        (error, results) => {
            console.log(results);
            if (error) {
                res.status(500);
            }
            else {
                res.status(200).json(results);
            }
        }
    );
});


module.exports = router;