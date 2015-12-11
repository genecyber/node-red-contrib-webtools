var fs = require('fs');
var assets = require('./assets.js');

assets.files.forEach(function(file_metadata){
    fs.unlinkSync(__dirname+file_metadata.path);
});
