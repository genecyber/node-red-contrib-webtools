'use strict';


//add menu page to create ws session
var ws;  
var wstimeout;
var qBackoff = 0;
var onMessageListener = false;

function statusChange(argv){
  chrome.browserAction.setBadgeBackgroundColor({color:argv.color});
       chrome.browserAction.setBadgeText({text:argv.text});
};

//Listeners and message handler

function sendMessage(message){
  var timestamp = (new Date()).getTime();
  message.timestamp = timestamp;

  chrome.storage.local.get({timestamp:null,server:null}, function(items){
    if(items.timestamp!=message.timestamp){
      chrome.storage.local.set({timestamp:message.timestamp}, function(){
           console.log(items);
           ws.send(JSON.stringify(message));
      });
    }
  }); 
}

onMessageListener = function (message,sender,callback) {
    if(message.content){
      sendMessage(message);
    }                   
  };

function initialize(){
  
  if(ws&&ws.readyState == 1){
   statusChange({text:"L", color:"#FFFF00"});
   ws.close();
   
   return null;
  }else{
    ws = wstimeout = null;
    qBackoff = 0;
    onMessageListener = false;
    chrome.storage.local.get({
      server:"",
      usecurrent:true,
      path:"/ws",
      port:"8080",
      secure:"false",
      websockets:"true"
    }, function(items) {
        var protocol = (items.secure)?"wss":"ws";
        
        if(items.websockets){
          statusChange({text:"D", color:"#FF0000"});
          var cF = function(){
            console.log('Trying to connect...'+qBackoff);
            if(!ws||ws.readyState !=1){
              ws = new WebSocket(protocol+"://"+items.server+":"+items.port+items.path);
              ws.onopen = function(){
                console.log('connected to: '+ws.url+" "+(new Date()).toUTCString());
                qBackoff = 0;
                statusChange({text:"C", color:"#00FF00"});
              };
          
              ws.onerror = function(){
                
                statusChange({text:"U", color:"#FF0000"});
                window.clearTimeout(wstimeout);
                qBackoff =Math.min(10000, (qBackoff=qBackoff+1000));
                wstimeout = window.setTimeout(cF, qBackoff);
              };
              
              ws.onclose = function(){
                statusChange({text:"D", color:"#FF0000"});
                console.log("Disconnected from: "+ws.url+" "+(new Date()).toUTCString());
              };
              
            };
          }.bind(this); 
          cF();
        }
        
        if(chrome.runtime.onMessage.hasListener(onMessageListener)){
          chrome.runtime.onMessage.removeListener(onMessageListener);
        }             
    });
  };
  chrome.runtime.onMessage.addListener(onMessageListener);
};
  var context = "all";
  var title = "Edit Page";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});  


// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
  console.log(info);
};

statusChange({text:"D", color:"#FF0000"});
chrome.browserAction.onClicked.addListener(initialize);