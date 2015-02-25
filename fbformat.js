var chatCount = 0;

//$('#ChatTabsPagelet').ready(function() {

//});
$(window).load( function() {

  setInterval(function(){checkUpdate()},5000);

  /*var injectedScript = document.createElement('script');
  injectedScript.src = chrome.extension.getURL('inject.js');
  injectedScript.setAttribute('async','');
  injectedScript.setAttribute('type','text/javascript');
  (document.head||document.documentElement).appendChild(injectedScript);
  console.log(injectedScript);*/

});



// Returns a jQuery object of all fb chat window messages in view.
function fetchMsgs(chat_lists) {
    //console.log(chat_lists);

    chat_lists = chat_lists.filter( function() {

      //console.log($(this).attr('formatted'));
      if(this.innerHTML.match(/(<span)|(<a)/)) {
      //|| $(this).attr('formatted') == 'true'){
        $(this).attr('formatted','true');
        return false;
      }
      return true;
    });

  //console.log(chat_lists);
  process(chat_lists);
}

function process(messages) {

  messages.each( function(index, msg) {
    //msg.innerHTML = msg.innerText;
    //console.log($(msg).attr('formatted'));
    var m = $(msg);
    m.html(msg.innerText);
    m.attr('formatted','true');
    //m.data('formatted', true);
  });
}

// Check if new messages have appeared.
function checkUpdate() {
  var bench = performance.now();
  //var chats = $("#ChatTabsPagelet .fbNub div.conversation div.direction_ltr span span");
//console.log(chats);
console.log('chatlog');
  var chats = $("#ChatTabsPagelet .fbNub div.conversation div.direction_ltr span span:not([formatted='true'], .emoticon, .emoticon_text)");
console.log(chats);
  var prev = chatCount;
  chatCount = chats.length;

  if (chatCount > prev) {
    fetchMsgs(chats);
    //console.log(chats);
  } else {
    chats.splice(0,chatCount);
    //console.log(chats);
  }
  console.log(performance.now() - bench);
}