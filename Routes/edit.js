var express = require('express'),
    router = express.Router();
const pool = require('../server.js').pool;

app.patch('/patch', function(req, res) {
    console.log(`METHOD: ${req.method}`);

    let query;
    let values = [];
    let post_id = req.body.post_id;

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
            status = 500;
            res.status(status).json({ error: 'Error updating the post.' });

        } else {
            status = 200;
            res.status(status).json({ message: 'Post updated successfully.' });
        }
        console.log(`RES: ${status}`);
    })
});

module.exports = router;