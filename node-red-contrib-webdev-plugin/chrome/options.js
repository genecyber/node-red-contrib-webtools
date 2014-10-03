'use strict';

document.getElementById("mainform").action = "javascript:void(0)";

function save_options(obj) {

  var saveObj = {
    server : document.getElementById('server').value,
    /*usecurrent : document.getElementById('usecurrent').checked,*/
    path : document.getElementById('path').value,
    port : document.getElementById('port').value,
    secure: document.getElementById('secure').checked/*,
    websockets: document.getElementById('websockets').checked*/
  };
  chrome.storage.local.set(saveObj, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
    
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default values.
  chrome.storage.local.get({
    server:"",
    usecurrent:true,
    path:"/ws",
    port:"8080",
    secure:"false"/*,
    websockets: "true"*/
  }, function(items) {
    document.getElementById('server').value = items.server;
    //document.getElementById('server').disabled = document.getElementById('usecurrent').checked = items.usecurrent;
    document.getElementById('path').value = items.path;
    document.getElementById('port').value = parseInt(items.port);
    document.getElementById('secure').checked = items.secure;
    //document.getElementById('websockets').checked = items.websockets;

  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('mainform').addEventListener('submit',
    save_options);
/*
document.getElementById('usecurrent').addEventListener('change',function(){

	document.getElementById('server').disabled = this.checked;

});*/