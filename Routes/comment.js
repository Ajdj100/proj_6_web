// Contains all /comment routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

//Handling the edit comment 
router.put('/', function(req, res) {
    console.log(`METHOD: ${req.method}`);
    pool.query(
        'UPDATE comment SET body = ? WHERE comment_id = ? AND post_id = ?', 
        [req.body.body, req.body.comment_id, req.body.post_id],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status).json({ error: 'Error updating the comment.' });
            } else {
                status = 200;
                res.status(status).json({ message: 'Comment updated successfully.' });
            }
            console.log(`RES: ${status}`);
        }
    )
});

//Handles user Comment request
router.post('/', function (req, res) {  
    console.log(`METHOD: ${req.method}`);
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO comment (body, post_id, user_id) VALUES (?, ?, ?)",
        [req.body.body, req.body.post_id, user_id],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status).send("Error creating a new comment");
            } else {
                status = 200;
                res.status(status).json({ comment_id: results.insertId });
            }
            console.log(`RES: ${status}`);
        }
    );
});

module.exports = router;