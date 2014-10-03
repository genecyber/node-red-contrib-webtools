'use strict';

chrome.extension.sendMessage( { 
    'to': chrome.devtools.inspectedWindow.tabId, 
    'message': 'ready' } );

/*
var muto = new MutationObserver(function(){console.log(arguments);});
muto.observe(document.getElementsByTagName('html')[0]);
muto.observe(document.getElementsByTagName('html')[0], {
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    });
*/
    
chrome.devtools.inspectedWindow.onResourceContentCommitted.addListener(function(resource, content) {
   chrome.extension.sendMessage( { 
    'tabId': chrome.devtools.inspectedWindow.tabId, 
    'url': resource.url,
	'content': content} );
  console.log(content);
})

chrome.devtools.panels.create("NRC-WebDev",
    "icon_16.png",
    "editorpanel.html",
	    function(panel) {
 	console.log(panel);   


	    });
