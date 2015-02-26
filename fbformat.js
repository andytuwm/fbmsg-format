var chatCount = 0;

$(window).load( function() {
  //checkUpdate();
  setInterval(function(){checkUpdate()},2000);

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
    //console.log($(msg).attr('formatted'));
    var m = $(msg);
    m.html(msg.innerText);
    // Mark it as formatted so that this element is not selected on next poll,
    // saving on processing time
    m.attr('formatted','true');
  });
}

// Check if new messages have appeared.
function checkUpdate() {
  var bench = performance.now();

  //{OLD SELECTOR FOR REFERENCE}var chats = $("#ChatTabsPagelet .fbNub div.conversation div.direction_ltr span span:not([formatted='true']");
  var chats = $("#ChatTabsPagelet .direction_ltr span span:not([formatted='true']");
//console.log(chats);
  var prev = chatCount;
  chatCount = chats.length;

  if (chatCount > prev) {
    filterMsgs(chats);
  } else {
    chats.splice(0,chatCount);
  }

  console.log(performance.now() - bench);
}