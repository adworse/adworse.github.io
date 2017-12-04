// HTML Truncator for jQuery
// by Henrik Nyh <http://henrik.nyh.se> 2008-02-28.
// Free to modify and redistribute with credit.

// Modified by kajabi.  Don't simply overwrite this

(function($) {

  var trailing_whitespace = true;

  $.fn.truncate = function(options) {

    var opts = $.extend({}, $.fn.truncate.defaults, options);

    jQuery(this).each(function() {

      var content_length = $.trim(squeeze(jQuery(this).text())).length;
      if (content_length <= opts.max_length)
        return;  // bail early if not overlong

      var actual_max_length = opts.max_length - opts.more.length - 3;  // 3 for " ()"
      var truncated_node = recursivelyTruncate(this, actual_max_length);
      var full_node = jQuery(this).hide();
      var more_content = opts.more;

      if (opts.link_more) {
        more_content = '<a href="#show more content">' + more_content + '</a>';
      }

      if (opts.more_parens) {
        more_content = '(' + more_content + ')';
      }

      truncated_node.insertAfter(full_node);

      findNodeForMore(truncated_node).append(' ' + more_content);
      //findNodeForLess(full_node).append(' (<a href="#show less content">'+opts.less+'</a>)');

      truncated_node.find('a:last').click(function() {
        truncated_node.hide(); full_node.show(); return false;
      });
      full_node.find('a:last').click(function() {
        truncated_node.show(); full_node.hide(); return false;
      });

    });
  }

  // Note that the " (…more)" bit counts towards the max length – so a max
  // length of 10 would truncate "1234567890" to "12 (…more)".
  $.fn.truncate.defaults = {
    max_length: 100,
    more_parens: true,
    link_more: true,
    more: '…more',
    less: 'less'
  };

  function recursivelyTruncate(node, max_length) {
    return (node.nodeType == 3) ? truncateText(node, max_length) : truncateNode(node, max_length);
  }

  function truncateNode(node, max_length) {
    var node = jQuery(node);
    var new_node = node.clone().empty();
    var truncatedChild;
    node.contents().each(function() {
      var remaining_length = max_length - new_node.text().length;
      if (remaining_length == 0) {
        var $this = jQuery(this);
        if ($this.prev('td, th').length) {
          $this.add($this.nextAll('td, th')).clone().html('…').appendTo(new_node);
        }
        return;  // breaks the loop
      }
      truncatedChild = recursivelyTruncate(this, remaining_length);
      if (truncatedChild) new_node.append(truncatedChild);
    });
    return new_node;
  }

  function truncateText(node, max_length) {
    var text = squeeze(node.data);
    if (trailing_whitespace)  // remove initial whitespace if last text
      text = text.replace(/^ /, '');  // node had trailing whitespace.
    trailing_whitespace = !!text.match(/ $/);
    var text = text.slice(0, max_length);
    // Ensure HTML entities are encoded
    // http://debuggable.com/posts/encode-html-entities-with-jquery:480f4dd6-13cc-4ce9-8071-4710cbdd56cb
    text = jQuery('<div/>').text(text).html();
    return text;
  }

  // Collapses a sequence of whitespace into a single space.
  function squeeze(string) {
    return string.replace(/\s+/g, ' ');
  }

  // Finds the last, innermost p or div; otherwise the parent
  function findNodeForMore(node) {
    var $node = jQuery(node);
    var last_child = $node.children(":last");
    if (last_child.is('p,div')) return findNodeForMore(last_child);
    return node;
  };

  // Finds the last child if it's a p; otherwise the parent
  function findNodeForLess(node) {
    var $node = jQuery(node);
    var last_child = $node.children(":last");


    if (last_child && last_child.is('p')) return last_child;
    return node;
  };

})(jQuery);
