var chatCount = 0;

$(window).load( function() {

  setInterval(function(){checkUpdate()},2000);

  /*var injectedScript = document.createElement('script');
  injectedScript.src = chrome.extension.getURL('inject.js');
  injectedScript.setAttribute('async','');
  injectedScript.setAttribute('type','text/javascript');
  (document.head||document.documentElement).appendChild(injectedScript);
  console.log(injectedScript);*/

});



// Returns a jQuery object of all fb chat window messages in view.
function fetchMsgs(chat_lists) {

    chat_lists = chat_lists.not('.emoticon,.emoticon_text');

    chat_lists = chat_lists.filter( function() {
      //console.log(this.innerHTML);
      if(this.innerHTML.match(/(<span)|(<a)/)){
        return false;
      }
      return true;
    });

  //console.log(chat_lists);
  process(chat_lists);
}

function process(messages) {
  messages.each( function(index, msg) {
    if( msg.getAttribute('formatted') != 'true'){
      msg.innerHTML = msg.innerText;
      msg.setAttribute('formatted',true);
    }
  });
}

// Check if new messages have appeared.
function checkUpdate() {
  var convo = $('#ChatTabsPagelet .fbNub div.conversation');
  var chats = convo.find('div.direction_ltr span span');

  var prev = chatCount;
  chatCount = chats.length;

  if (chatCount > prev) {
    fetchMsgs(chats);
    console.log(chats);
  } else {
    chats.splice(0,chatCount);
    console.log(chats);
  }
}