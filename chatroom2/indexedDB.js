var myDB = {
    name: 'logs',
    version: 1,
    db: null
};

//打开数据库
function openDB(name, version) {
    console.log("openDB " + name);
    var version = version || 1;
    var request = window.indexedDB.open(name, version);
    request.onerror = function(event) {
        console.log(event.currentTarget.error.message);
    };
    request.onsuccess = function(event) {
        myDB.db = event.target.result;
        console.log('DB open');
    };
    request.onupgradeneeded = function(event) {
        console.log('DB version changed to ' + version);
        db = event.target.result;
        var objectStore;
        if (!db.objectStoreNames.contains('log')) {
            objectStore = db.createObjectStore('log', {
                keyPath: 'id',
                autoIncrement: true
            });
        }
    };
}

//添加数据
function addData(name, data, data1, data2) {
    var request = myDB.db.transaction(['log'], 'readwrite').objectStore('log').add({
        name: name,
        time: data,
        tag: data1,
        message: data2
    });
    request.onsuccess = function(event) {
        console.log('数据写入成功');
    };
    request.onerror = function(event) {
        console.log('数据写入失败');
    }
}

function clearData() {
    $('.j-message').empty();

    var request = myDB.db.transaction(['log'], 'readwrite').objectStore('log').clear();
    request.onsuccess = function(event) {
        console.log('清理成功');
    };
    request.onerror = function(event) {
        console.log('清理失败');
    }
}

function exportData() {
    var data = new Array();
    var objectStore = myDB.db.transaction('log').objectStore('log');
    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var tmp = '\"';
            //tmp += cursor.key;
            tmp += cursor.value.name; tmp += '","';
            tmp += cursor.value.time; tmp += '","';
            tmp += cursor.value.tag; tmp += '","';
            tmp += cursor.value.message.replace(/["]/g, function(m) { return '""'; }); tmp += '"';
            //console.log(tmp);
            data.push(tmp);
            cursor.continue();
        } else {
            var blob = new Blob([arrayToString(data)], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, "导出文件.csv");
        }
    };
}

function arrayToString(arr) {
    let str = '';
    arr.forEach(function(i, index) {
        str += i;
        if (index != (arr.length - 1)) {
            str += '\n';
        };
    });
    return str;
}
