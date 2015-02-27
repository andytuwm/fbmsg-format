var chatCount = 0;
var openChatInterval = 1000;
var openChat = false;
var inFullChat = false;

$(window).load( function() {
  //checkUpdate();

  // Check if in full conversation view
  setInterval(function() {
    //var benchmark = performance.now();
    inFullChat = isFullChat();
    //console.log(performance.now() - benchmark);
  },1000);

  // setTimeout used and called recursively rather than setInterval in order to
  // be able to change the timing interval between calls of checkOpen()
  setTimeout(runCheck, openChatInterval);

  setInterval(function() {
    //var bench = performance.now();
    if (openChat) {
      checkUpdate();
    }
    //console.log(performance.now() - bench);
  },2000);

  setInterval(function() {
    //var bench = performance.now();
    if (inFullChat) {
      //TODO
    }
    //console.log(performance.now() - bench);
  },2000);

  /*var injectedScript = document.createElement('script');
  injectedScript.src = chrome.extension.getURL('inject.js');
  injectedScript.setAttribute('async','');
  injectedScript.setAttribute('type','text/javascript');
  (document.head||document.documentElement).appendChild(injectedScript);
  console.log(injectedScript);*/

});

// Filters out extra <span>/<a> tags from the jQuery object passed in
function filterMsgs(chat_lists) {
    //console.log(chat_lists);
    chat_lists = chat_lists.not('.emoticon,.emoticon_text');
    chat_lists = chat_lists.filter( function() {

      // If <span> starts with <span data and/or has a link, throw that
      // element away since there is another <span> that will be processed.
      if(this.innerHTML.match(/(^(<span data))|(<a)/)) {
        // Despite removing it from processing, we still need to mark it as formatted
        // to prevent the next poll from selecting this element.
        $(this).attr('formatted','true');
        return false;
      }

      // If this element has two or more children, it must contain emoticons.
      // Ignore <span>'s that have only one children; emoticons consist of two <span>'s.
      // We will process this first before process() because it's easier.
      var t = $(this);
      if (t.children().length > 1) {
        // Split the span element into emoticons and text nodes, then check them one by one
        t.contents().each( function(index, el) {
          if(el.nodeType === 3) {
            // If el is a text node(3), wrap it in <span> and turn it into HTML.
            var newEl = $(el).wrap("<span></span>").parent();
            newEl.html(newEl.text());
          }
        });
        // Mark as formatted.
        t.attr('formatted','true');
        return false;
      }
      return true;
    });
  //console.log(chat_lists);
  process(chat_lists);
}

// Set the innerText as innerHTML so that fb will display it as HTML
function process(messages) {

  messages.each( function(index, msg) {
    var m = $(msg);
    m.html(msg.innerText);
    // Mark it as formatted so that this element is not selected on next poll,
    // saving on processing time
    m.attr('formatted','true');
  });
}

// Check if new messages have appeared. If appeared, update the new message.
function checkUpdate() {

  //{OLD SELECTOR FOR REFERENCE}var chats = $("#ChatTabsPagelet .fbNub div.conversation div.direction_ltr span span:not([formatted='true']");
  var chats = $("#ChatTabsPagelet .opened .direction_ltr span span:not([formatted='true']");
//console.log(chats);
  var prev = chatCount;
  chatCount = chats.length;
  // If there are more than previous count, there has been an update
  if (chatCount > prev) {
    filterMsgs(chats);
  } else {
    chats.splice(0,chatCount);
  }
}

// Check if any chat tabs are open or not
function checkOpen() {
  var openedChats = $("#ChatTabsPagelet").find(".opened");
  //console.log(openedChats);
  if (openedChats.length) {
    openChatInterval = 5000;
    return true;
  } else {
    openChatInterval = 1000;
    return false;
  }
}

// Function to assist in changing interval time of checkOpen()
var runCheck = function() {
    //var bench = performance.now();
    openChat = checkOpen();
    //var mark = performance.now() - bench
    //console.log('check: ' + mark);
    setTimeout(runCheck, openChatInterval);
};

// Check if current page is showing a full fb message conversation.
function isFullChat() {
  if(~$('#pageTitle').text().indexOf('Messages')) {
    return true;
  // ~ is a bitwise inverse. If indexOf() does not find substring,
  // then it returns -1, a truthy value, which is all 1's. Inversing that
  // obtains all 0's, which is 0, a false value. Thus ~ makes indexOf()
  // useful for checking if a specific substring exists or not.
  }
  return false;
}