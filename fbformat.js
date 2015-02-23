var chatCount = 0;

$(window).load( function() {

  setInterval(function(){process(fetchMsgs())},2000);

  /*var injectedScript = document.createElement('script');
  injectedScript.src = chrome.extension.getURL('inject.js');
  injectedScript.setAttribute('async','');
  injectedScript.setAttribute('type','text/javascript');
  (document.head||document.documentElement).appendChild(injectedScript);
  console.log(injectedScript);*/

});



// Returns a jQuery object of all fb chat window messages in view.
function fetchMsgs() {
  var convo = $('#ChatTabsPagelet .fbNub div.conversation');
  var chat_lists = convo.find('div.direction_ltr span span');

  var prev = chatCount;
  chatCount = chat_lists.length;

  if(chatCount > prev) {
    chat_lists = chat_lists.not('.emoticon,.emoticon_text');

    chat_lists = chat_lists.filter( function() {
      //console.log(this.innerHTML);
      if(this.innerHTML.match(/^(<span)/)){
        return false;
      }
      return true;
    });

  } else {
    chat_lists.splice(0,chatCount);
  }
  //console.log(chat_lists);
  return chat_lists;
}

function process(messages) {
  messages.each( function(index, msg) {
    if( msg.getAttribute('formatted') != 'true'){
      msg.innerHTML = msg.innerText;
      msg.setAttribute('formatted',true);
    } else {
      //console.log('already formatted.');
    }
  });
}



