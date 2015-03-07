var openChat = false;
var inFullChat = false;

$(window).load( function() {
  var convoCount = 0;

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

  // Process messages in chat tabs that are already open when Facebook is loaded, once.
  initialProcess();
  // Define observer for any newly loaded messages.
  var chatObserver = startObserveChat();
  chatObserver.observe($('#ChatTabsPagelet').find('.videoCallEnabled')[0], {
    subtree: true,
    childList: true
  });

  setInterval(function() {
    if (inFullChat) {
      fullCheckUpdate(convoCount);
    }
  },1337);

  // Unload observers when leaving page
  $(window).bind('beforeunload', function(e) {
    titleObserver.disconnect();
    chatObserver.disconnect();
  });

});

// Legacy function originally used to process messages before DOM mutation
// observers were used. Streamlined and kept because it's useful for processing
// messages that were initially loaded when Facebook was started, since those
// are not detected by mutation observers.
function initialProcess() {

    var chat_lists = $("#ChatTabsPagelet").find(".opened .direction_ltr span span");
    chat_lists = chat_lists.not('.emoticon,.emoticon_text');
    chat_lists = chat_lists.filter( function() {

      // If <span> starts with <span data and/or has a link, throw that
      // element away since there is another <span> that will be processed.
      if(this.innerHTML.match(/(^(<span data))|(<a)/)) {
        return false;
      }

      // If this element has a child <span> element, it must contain emoticons.
      if (this.getElementsByTagName('span').length) {
        var t = $(this);
        // Split the span element into emoticons and text nodes, then process them one by one
        t.contents().each( function(index, el) {
          if(el.nodeType === 3) {
            // If el is a text node(3), wrap it in <span> to turn it into HTML.
            var newEl = $(el).wrap("<span></span>").parent();
            newEl.html(newEl.text());
          }
        });
        return false;
      }
      return true;
    });

  // Set the innerText as innerHTML so that fb will display it as HTML
  chat_lists.each( function(index, msg) {
    $(msg).html(msg.innerText);
  });
}

// Check if there are new messages in full conversation view.
function fullCheckUpdate(convoCount) {
  var chats = $("#webMessengerRecentMessages").find('li.webMessengerMessageGroup .direction_ltr p');
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

// Title observer callback
function startObserveTitle() {
  return observer = new window.WebKitMutationObserver(function(mutations) {
    // ~ is a bitwise inverse. If indexOf() does not find substring,
    // then it returns -1, a truthy value, which is all 1's. Inversing that
    // obtains all 0's, which is 0, a false value. Thus ~ makes indexOf()
    // useful for checking if a specific substring exists or not.
    if(~mutations[0].addedNodes[0].data.indexOf('Messages')) {
      inFullChat = true;
      return;
    } else {
      inFullChat = false;
      return;
    }
  });
}

// Chat tabs observer callback
function startObserveChat() {
  return observer = new window.WebKitMutationObserver(function(mutations) {
  	mutations.forEach(function( mutation ) {
  	  // Observes for newly loaded messages as wells as newely sent/received ones.
  	  if(mutation.target.parentElement.className == "conversation") {
      	var node = $(mutation.addedNodes[0]).find('span span');
      	var text = node.text();
      	node.html(text);
  	  }
      // Observes for fb overwriting initial formatting when emoticons are used.
  	  if(mutation.target.localName == "span" && mutation.target.classList.length == 1) {
  	    // Some nodes need to be traversed because the target node the observer
  	    // detected a change on is an ancestor of the actual node we need.
    	  $(mutation.addedNodes[0].children[0]).contents().each(function(index, el) {
          if(el.nodeType === 3) {
            // Wrap in <span> to ensure it formats as HTML
            var newEl = $(el).wrap("<span></span>").parent();
            newEl.html(newEl.text());
          }
        });
  	  }
  	});
  });
}