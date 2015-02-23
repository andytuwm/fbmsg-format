$(window).load( function() {
  var messages = fetchMsgs();
  console.log(messages);
  process(messages);
});

// Returns a jQuery object of all fb chat window messages in view.
function fetchMsgs() {
  var convo = $('#ChatTabsPagelet .fbNub div.conversation');
  var chat_lists = convo.find('div.direction_ltr span span');

  chat_lists = chat_lists.not('.emoticon,.emoticon_text');

  chat_lists = chat_lists.filter( function() {
    //console.log(this.innerHTML);
    if(this.innerHTML.match(/^(<span)/)){
      return false;
    }
    return true;
  });

  return chat_lists;
}

function process(messages) {
  messages.each( function(index, msg) {
    msg.innerHTML = "<i> damn </i>";
  });
}