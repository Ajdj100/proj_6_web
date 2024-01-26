var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {  // handle specific get/post/etc methods
    res.send('hello').status(200);
});

module.exports = router;
