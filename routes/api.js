var express = require('express');

var router = express.Router();
router.get('/whitelist', whitelist);

var fileToJson = require('./file-tool').fileToJson;

function whitelist(req, res, next) {
    function cb(err, data) {
        if (err) {
            res.sendStatus(404);
        } else {
            res.header("Content-Type", "application/json");
            res.end(JSON.stringify(data));
        }
    }

    req.cacheCb = cb;
    fileToJson('./routes/json/whitelist.json', req.cacheCb);
}

module.exports = router;
