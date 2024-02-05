// Contains all /comment routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;


//Handling the edit comment 
router.patch('/', function(req, res) {
    
    pool.query(
        'UPDATE comment SET body = ? WHERE comment_id = ? AND post_id = ?', 
        [req.body.body, req.body.comment_id, req.body.post],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Error updating the comment.' });
            } else {
                res.status(200).json({ message: 'Comment updated successfully.' });
            }
        }
    )
});


//Handles user Comment request
router.post('/', function (req, res) {  
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO comment (body, post_id, user_id) VALUES (?, ?, ?)",
        [req.body.body, req.body.post_id, user_id],
        (error, results) => {
            if (error) {
                res.status(500).send("Error creating a new comment");
            } else {
                res.status(200).json({ comment_id: results.insertId });
            }
        }
    );
});



module.exports = router;