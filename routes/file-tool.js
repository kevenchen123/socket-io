function fileToJson(filePath, callback) {
    var fs = require('fs');

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        var obj = JSON.parse(data);
        console.log("json = " + JSON.stringify(obj));
        callback(null, obj);
    });
}

exports.fileToJson = fileToJson;