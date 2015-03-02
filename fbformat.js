var chatCount = 0;
var convoCount = 0;
var openChat = false;
var inFullChat = false;
var openChatInterval = 1000;

$(window).load( function() {

  // Add eventlistener listening for changing a full conversation thread view
  $('#content').on('focusout','.uiScrollableArea', function() {
    convoCount = 0;
  });

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
      fullCheckUpdate();
    }
    //console.log(performance.now() - bench);
  },2000);

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
        this.setAttribute('formatted','true');
        return false;
      }

      // If this element has two or more children, it must contain emoticons.
      // Ignore <span>'s that have only one children; emoticons consist of two <span>'s.
      // We will process this first before process() because it's easier.

      if (this.getElementsByTagName('span').length) {
        var t = $(this);
        // Split the span element into emoticons and text nodes, then check them one by one
        t.contents().each( function(index, el) {
          if(el.nodeType === 3) {
            // If el is a text node(3), wrap it in inline <p> to turn it into HTML.
            var newEl = $(el).wrap("<p style='display:inline'></p>").parent();
            newEl.html(newEl.text());
          }
        });
        // Mark as formatted.
        //t.attr('formatted','true');
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
    $(msg).html(msg.innerText);
    // Mark it as formatted so that this element is not selected on next poll,
    // saving on processing time
    msg.setAttribute('formatted','true');
  });
}

// Check if new messages have appeared. If appeared, update the new message.
function checkUpdate() {

  var chats = $("#ChatTabsPagelet").find(".opened .direction_ltr span span");
//console.log(chats);
  var prev = chatCount;
  chatCount = chats.length;
  // If there are more than previous count, there has been an update
  if (chatCount > prev) {
    chats = chats.not('[formatted="true"]');
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

function fullCheckUpdate() {
  //var bench = performance.now();
  var chats = $("#webMessengerRecentMessages").find('li.webMessengerMessageGroup .direction_ltr p');
  //console.log(performance.now() - bench);
//console.log(chats);
  var prev = convoCount;
  convoCount = chats.length;

  if (convoCount != prev) {
    // Faster to just select all elements and just filter it here.
    chats = chats.not('[formatted="true"]');
    fullConvoFormat(chats);
  } else {
    // Remove old unneeded elements.
    chats.splice(0,convoCount);
  }
}

function fullConvoFormat(messages) {
  //console.log(messages);
  messages = messages.filter( function() {
    if(this.getElementsByTagName('span').length) {
       $(this).contents().each( function(index, el) {
          if(el.nodeType === 3) {
            // We use <span> here because the element we use to select messages
            // is a <p> in full conversations.
            var newEl = $(el).wrap("<span></span>").parent();
            newEl.html(newEl.text());
          }
        });
      return false;
    }
    return true;
  });

  messages.each( function(index, msg) {
    $(msg).html(msg.innerText);
    msg.setAttribute('formatted','true');
  });
}