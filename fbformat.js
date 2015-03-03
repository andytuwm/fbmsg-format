var openChat = false;
var inFullChat = false;

$(window).load( function() {

  var convoCount = 0,
      chatCount = 0;

  // Define observer for Page Title to check if in full conversation view.
  var titleObserver = startObserveTitle();
  titleObserver.observe(document.getElementById('pageTitle'), {
    characterData: true,
    childList: true
  });

  // Add eventlistener listening for changing a full conversation thread view.
  $('#content').on('focusout','.uiScrollableArea', function() {
    convoCount = 0;
  });

  // Define observer for checking if a chat tab is open or not.
  var openchatObserver = startObserveOpenChat();
  openchatObserver.observe($('#ChatTabsPagelet').find('.videoCallEnabled')[0], {
    subtree: true,
    attributes: true
  });

  setInterval(function() {
    //var bench = performance.now();
    if (openChat) {
      checkUpdate(chatCount);
    }
    //console.log(performance.now() - bench);
  },2000);

  setInterval(function() {
    //var bench = performance.now();
    if (inFullChat) {
      fullCheckUpdate(convoCount);
    }
    //console.log(performance.now() - bench);
  },2000);

  //TODO preparation for unloading listeners and observers
  $(window).bind('beforeunload', function(e) {
    titleObserver.disconnect();
    openchatObserver.disconnect();
  });

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
function checkUpdate(chatCount) {

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

// Check if there are new messages in full conversation view.
function fullCheckUpdate(convoCount) {
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

// Format HTML for full conversation view.
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

// Title observer callback defined here
function startObserveTitle() {
  return observer = new window.WebKitMutationObserver(function(mutations) {
    // ~ is a bitwise inverse. If indexOf() does not find substring,
    // then it returns -1, a truthy value, which is all 1's. Inversing that
    // obtains all 0's, which is 0, a false value. Thus ~ makes indexOf()
    // useful for checking if a specific substring exists or not.
    if(~mutations[0].addedNodes[0].data.indexOf('Messages')) {
      inFullChat = true;
    } else {
      inFullChat = false;
    }
    return;
  });
}

function startObserveOpenChat() {
  return observer = new window.WebKitMutationObserver(function(mutations) {
    var mLength = mutations.length;
  	for(var i = 0; i < mLength; i++) {
  	  if(mutations[i].attributeName == "class") {
  	    /*var mutationTarget = mutations[i].target;
  	    console.log(mutationTarget);
  	    if(~mutationTarget.className.indexOf('fbNub')) {
  	      openChat = mutationTarget.classList.contains('opened');
  	      console.log(openChat);
  	      break;
  	    }*/
  	    if($("#ChatTabsPagelet").find(".opened").length){
  	      openChat = true;
  	      break;
  	    } else {
  	      openChat = false;
  	      break;
  	    }
  	  }
  	}
  });
}