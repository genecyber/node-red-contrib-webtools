var target;
var editable = false;
var className = "cssStyle";

var style = document.createElement('style');
style.type = 'text/css';

style.innerHTML = '.'+className+' { border: 1px solid red; }';
document.getElementsByTagName('head')[0].appendChild(style);

    
var muto = new MutationObserver(function(){
  var content = document.getElementsByTagName('body')[0].innerHTML;
   console.log(arguments);
   chrome.runtime.sendMessage( { 
	'content': content} );
  });
/*
muto.observe(document.getElementsByTagName('body')[0], {
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    });
*/

document.getElementsByTagName('html')[0].addEventListener("mouseup", function(e){
  target = e.toElement;
  editable = !editable;
  var path = [];
  var el = e.toElement;
 
  var tags = document.getElementsByTagName(target.tagName);
  console.log(tags);
  for(i=0;i<tags.length;i++){
    
    if(tags[i] == target){
      console.log(target.tagName+"["+i+"]");
      console.log(tags[i]);
    }
  };
  
  console.log(path.join(" > "));
  
  if(!editable){
    //target.className = target.className.replace(" "+className, "");
    return target = null;
    
  }else{
    
   // target.className = target.className.replace(" "+className, "")+" "+className;
    
  }
});