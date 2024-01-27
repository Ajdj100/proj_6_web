var express = require('express');
var router = express.Router();

router.post('/signup', function (req, res) {  // handle specific get/post/etc methods
    pool.query(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [req.body.username, req.body.password],
        (error, results) => {
            if (error) {
                res.status(500).send("Error Signing up a user");
            } else {
                res.status(200).json(results[0]);
            }
        }

    );
});

module.exports = router;
