// Contains all /post routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;


// Endpoint to return the data of a single post
router.get("/", function (req, res) {
    console.log("Post ID:", req.query.id);

    pool.query('SELECT p.post_id, p.title, p.body AS post_body, u.username AS post_username, c.comment_id, IFNULL(c.body, "") AS comment_body, IFNULL(cu.username, "") AS comment_username FROM post p LEFT JOIN comment c ON p.post_id = c.post_id JOIN user u ON p.user_id = u.user_id LEFT JOIN user cu ON c.user_id = cu.user_id WHERE p.post_id = ?;',
        [req.query.id],
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

//Handles user Post request
router.post('/', function (req, res) {
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO post (user_id, title, body) VALUES (?, ?, ?)",
        [user_id, req.body.title, req.body.body],
        (error, results) => {
            if (error) {
                res.status(500).send("Error creating a new post");
            } else {
                res.status(200).json({ post_id: results.insertId });
            }
        }

    );
});

//Handling the edit post 
router.patch('/', function (req, res) {

    let query;
    let values = [];

    // We Patching both title and Body
    if (req.body.title && req.body.body) {
        query = 'UPDATE post SET title = ?, body = ? WHERE post_id = ?';
        values = [req.body.title, req.body.body, req.body.post_id];

        // We Patching only Title
    } else if (req.body.title) {
        query = 'UPDATE post SET title = ? WHERE post_id = ?';
        values = [req.body.title, req.body.post_id];

        // We Patching only Body
    } else if (req.body.body) {
        query = 'UPDATE post SET body = ? WHERE post_id = ?';
        values = [req.body.body, req.body.post_id];
    }

    // Execute based on the different scenario
    pool.query(query, values, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error updating the post.' });
        } else {
            res.status(200).json({ message: 'Post updated successfully.' });
        }
    })
});

//Handling the edit post 
router.delete('/', function (req, res) {

    console.log(req.body.post_id);
    
    pool.query("DELETE FROM post WHERE post_id = ?; DELETE FROM comment WHERE post_id = ?;",   //todo, create delete query
        [req.body.post_id, req.body.post_id],
        (error, results) => {
            if (error) {
                res.status(500).send("Error deleting the post");
                console.error(error);
            } else {
                res.status(200);
            }
        }
    )   
});
module.exports = router;