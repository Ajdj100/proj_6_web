// Contains all /post routes

var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;


// Endpoint to return the data of a single post
router.get("/", function (req, res) {
    console.log(`METHOD: ${req.method}`);
    console.log("POST ID:", req.query.id);
    pool.query('SELECT p.post_id, p.title, p.body AS post_body, u.username AS post_username, c.comment_id, IFNULL(c.body, "") AS comment_body, IFNULL(cu.username, "") AS comment_username FROM post p LEFT JOIN comment c ON p.post_id = c.post_id JOIN user u ON p.user_id = u.user_id LEFT JOIN user cu ON c.user_id = cu.user_id WHERE p.post_id = ?;',
        [req.query.id],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
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
});

//Handles user Post request
router.post('/', function (req, res) {
    console.log(`METHOD: ${req.method}`);
    let user_id = req.body.user_id;
    pool.query(
        "INSERT INTO post (user_id, title, body) VALUES (?, ?, ?)",
        [user_id, req.body.title, req.body.body],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status).send("Error creating a new post");
            } else {
                status = 200;
                res.status(status).json({ post_id: results.insertId });
            }
            console.log(`RES: ${status}`);

        }

    );
});

//Handling the edit post 
router.patch('/', function (req, res) {
    console.log(`METHOD: ${req.method}`);

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
        console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
        let status = 0;
        if (error) {
            status = 500
            res.status(status).json({ error: 'Error updating the post.' });
        } else {
            status = 200;
            res.status(status).json({ message: 'Post updated successfully.' });
        }
        console.log(`RES: ${status}`);
    })
});

//Handling the edit post 
router.delete('/', function (req, res) {
    console.log(`METHOD: ${req.method}`);
    console.log(`POST ID: ${req.body.post_id}`);
    pool.query("DELETE FROM comment WHERE post_id = ?;",   //todo, create delete query
        [req.body.post_id],
        (error, results) => {
            console.log(`QUERY: ${JSON.stringify(results, 0, 2)}`);
            let status = 0;
            if (error) {
                status = 500;
                res.status(status).send("Error deleting the post");
                console.error(error);
            } else {
                //awful nested operation
                pool.query("DELETE FROM post WHERE post_id = ?;",   //todo, create delete query
                    [req.body.post_id],
                    (error, results) => {
                        console.log(`SECOND QUERY: ${JSON.stringify(results, 0, 2)}`);
                        if (error) {
                            status = 500;
                            res.status(status).send("Error deleting the post");
                            // console.error(error);
                            return;
                        } else {
                            status = 200;
                            res.status(status).send("Deleted post");
                        }
                    }
                );
            }
            console.log(`RES: ${status}`);
        }
    );
});

module.exports = router;