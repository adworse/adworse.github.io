// $(function() {
//   $('#coupon_code').blur(function() {
//     Coupon.lookupCoupon(this.val());
//   })
// });

Date.prototype.toUsShortDateString = function(){
  var abbreviatedMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      monthIdx = this.getMonth(),
      day = this.getDate(),
      militaryHour = this.getHours(),
      minute = this.getMinutes();

  var month = abbreviatedMonthNames[monthIdx];
  var hour = militaryHour < 13 ? militaryHour : militaryHour - 12;
  var time = [hour, minute].join(":");
  var meridianIndicator = militaryHour < 12 ? "AM" : "PM";

  return [month, day, time, meridianIndicator].join(" ");
};

playbackUnhide = function(doScroll){
  if (jQuery('.playback-hidden:first').is(':hidden')) {
    jQuery('.playback-hidden').fadeIn();
  }
};

// jQuery.fn.forbidBlankComments = function() {
//   if($(this).find('textarea').val() == '') {
//     alert("BLANK!");
//     return false;
//   } else {
//     alert("NOT BLANK!");
//     return true;
//   };
// };

jQuery.fn.hoverIntent = function(f,g) {
  // default configuration options
  var cfg = {
    sensitivity: 7,
    interval: 100,
    timeout: 0
  };
  // override configuration options with user supplied object
  cfg = jQuery.extend(cfg, g ? { over: f, out: g } : f );

  // instantiate variables
  // cX, cY = current X and Y position of mouse, updated by mousemove event
  // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
  var cX, cY, pX, pY;

  // A private function for getting mouse position
  var track = function(ev) {
    cX = ev.pageX;
    cY = ev.pageY;
  };

  // A private function for comparing current and previous mouse position
  var compare = function(ev,ob) {
    ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
    // compare mouse positions to see if they've crossed the threshold
    if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
      jQuery(ob).unbind("mousemove",track);
      // set hoverIntent state to true (so mouseOut can be called)
      ob.hoverIntent_s = 1;
      return cfg.over.apply(ob,[ev]);
    } else {
      // set previous coordinates for next time
      pX = cX; pY = cY;
      // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
      ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
    }
  };

  // A private function for delaying the mouseOut function
  var delay = function(ev,ob) {
    ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
    ob.hoverIntent_s = 0;
    return cfg.out.apply(ob,[ev]);
  };

  // A private function for handling mouse 'hovering'
  var handleHover = function(e) {
    // next three lines copied from jQuery.hover, ignore children onMouseOver/onMouseOut
    var p = (e.type == "mouseover" ? e.fromElement : e.toElement) || e.relatedTarget;
    while ( p && p != this ) { try { p = p.parentNode; } catch(e) { p = this; } }
    if ( p == this ) { return false; }

    // copy objects to be passed into t (required for event object to be passed in IE)
    var ev = jQuery.extend({},e);
    var ob = this;

    // cancel hoverIntent timer if it exists
    if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

    // else e.type == "onmouseover"
    if (e.type == "mouseover") {
      // set "previous" X and Y position based on initial entry point
      pX = ev.pageX; pY = ev.pageY;
      // update "current" X and Y position based on mousemove
      jQuery(ob).bind("mousemove",track);
      // start polling interval (self-calling timeout) to compare mouse coordinates over time
      if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

    // else e.type == "onmouseout"
    } else {
      // unbind expensive mousemove event
      jQuery(ob).unbind("mousemove",track);
      // if hoverIntent state is true, then call the mouseOut function after the specified delay
      if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
    }
  };

  // bind the function to the two event listeners
  return this.mouseover(handleHover).mouseout(handleHover);
};

/*
  Community Comments
*/

jQuery.show_reply_area = function(comment_id, init_comment ) {
  if (init_comment){
    jQuery('#comment_replies_' + comment_id).show();
  }
  jQuery('#comment_reply_field_wrapper_' + comment_id).show();
  jQuery('#comment_reply_field_' + comment_id).focus();
  jQuery('#comment_reply_field_' + comment_id).val('');
};

jQuery.reply_field_blur = function(comment_id) {
  if (jQuery('#comment_reply_field_' + comment_id).val() == "") {
    jQuery('#comment_reply_field_wrapper_' + comment_id).hide();
  }
};

jQuery.submit_bulk_actions = function() {
  jQuery('#bulk_action').val(jQuery('bulk_select_box').val());
  jQuery('bulk_approval_form').submit();
};

jQuery.toggle_comment = function(id) {
  el = jQuery("#comment_video_" + id);

  if (jQuery(el).is(':visible')) {
    jQuery(el).hide();
  } else {
    jQuery(el).show();
  }
};

var showReply = function(el) {
  $.show_reply_area($(el).data('comment-id'), true);
  $(el).next('.cancel_reply_link').show();
  $(el).hide();
}

var cancelReply = function(el) {
  $('#comment_reply_field_wrapper_' + $(el).data('comment-id')).hide();
  $(el).prev('.main_write_reply_link').show();
  $(el).hide();
}

jQuery.fn.visibleTimeago = function() {
  this.timeago().css('visibility', 'visible');
};

jQuery(function($){
  $('span.timeago').visibleTimeago();

  $("#private_message_search_form .add-on").click(function() {
    var $form = $("#private_message_search_form");
    if($form.find('input[type="text"]').val().length) {
      $form.submit();
    }
  });

  $("ul.comment-info-line li:last-child").addClass('last-item');

  jQuery('.preview-create-warning').click(function(e){
    e.preventDefault();
    alert("Only project users can create user generated content.");
  });

  jQuery('.ajaxful-rating li a').postClickWithAjax();

  $('.vr_toggle_link').live('click', function(){
    jQuery.toggle_comment($(this).attr('id'));
    return false;
  });

  $('.single_comment_show_all').live('click', function(){
    id = $(this).attr('id').split('show_hidden_replies_');
    $(this).hide();
    $('#comment_hidden_replies_' + id[1]).show();
    return false;
  });

  $('.edit_comment').ajaxSubmit();
  $('.edit_comment_link').ajaxGet();
  $('.comment_edit').live('click', function(){
    $(this).closest('ul').next().slideDown('slow');
  });

  $('.main_write_reply_link').live('click', function(e){
    e.preventDefault();
    showReply($(this));
  });
  
  $('.cancel_reply_link').live('click', function(e) {
    e.preventDefault();
    cancelReply($(this));
  });

  // $('#affiliate_reporting_date_selects select').change(function(){
  //  var filter_page = $(this).attr('id').split('_filter');
  //  jQuery.wait();
  //  $.ajax({
  //    url:           filter_page[0],
  //    type:         'get',
  //    dataType:       'script',
  //    data:           { 'filter_by' : $(this).val() }
  //  });
  // });

  // $("textarea[id^='comment_reply_field_']").live('blur', function(){
  //  id = $(this).attr('id').split('comment_reply_field_');
  //  $.reply_field_blur(id[1]);
  // });

  $('.funnel-testimonial-footer #back, .funnel-testimonial-footer #next').click(function() {
    var action = $(this).attr('id');
    var current = $('.single-testimonial:visible');
    if(action == 'next'){
      if($(current).attr('id') == 'filsaime'){
        $('#kern').fadeIn(2000);
      } else {
        $(current).next('.single-testimonial').fadeIn(2000);
      }
      $(current).animate({left: -300}, function(){
        $(current).hide();
        $(current).css('left', '0px');
      });
    } else {
      if($(current).attr('id') == 'kern'){
        $('#filsaime').fadeIn(2000);
      } else {
        $(current).css('left', '0px');
        $(current).prev('.single-testimonial').fadeIn(2000);
      }
      $(current).animate({left: +300}, function(){
        $(current).hide();
        $(current).css('left', '0px');
      });
    };
  });

  var showHeaderMoreContent = function(el) {
    var $el = $(el);
    $el.find('div.header-navigation-more-content-container').fadeIn('fast');
    if( $('html').hasClass('ie') ) {
      $('iframe,embed,object').css('visibility','hidden');
    }
  };

  var headerHoverOverCallback = function(el) {
    var $el = $(el);
    var categoryId = $el.find('a').first().data('attribute-id');

    if ($el.find('.header-navigation-more-content-container')[0]) {
      showHeaderMoreContent(el);
    } else {
      $.get("/categories/" + categoryId + "/child_nav", function(html){
        $el.append(html);
        showHeaderMoreContent(el);
      });
    }
  };

  $('li.header-navigation-more-content').hoverIntent({
    interval: 50,
    sensitivity: 4,
    timeout: 50,
    over: function(){
      var $this = $(this);

      if ($this.find('.arrow-down')[0]) {
        headerHoverOverCallback(this);
      }
    },
    out: function(){
      $(this).find('div.header-navigation-more-content-container').fadeOut('fast');
      if( $('html').hasClass('ie') ) {
        $('iframe,embed,object').css('visibility','visible');
      }
    }
  });

  $('ul.header-navigation-list li.header-navigation-list-dashboard, ul.header-navigation-list li.header-navigation-more-content').hover(function() {
    $(this).find('a:first').addClass('header-main-navigation-link-hover');
  }, function() {
    $(this).find('a:first').removeClass('header-main-navigation-link-hover');
  });

  $('.header-navigation-more-content-item').hover( function(){
    $(this).find('a:first').addClass('header-navigation-submenu-level-1-hover');
  }, function(){
    $(this).find('a:first').removeClass('header-navigation-submenu-level-1-hover');
  });

  //$('.next_page').ajaxGet();

  $('.single_comment_show_all').live('click', function(){
          id = $(this).attr('id').split('show_hidden_replies_');
          $(this).hide();
          $('#comment_hidden_replies_' + id[1]).show();
          return false;
      });
  
  $('[data-plan-name]', '#admin-bar').click(function() {
    $.cookie('admin_preview_as', $(this).data('plan-name'), { path: '/' });
    location.reload();
  });
  
  $('.dropdown-toggle').dropdown()


  $('#new_comment, .new_reply').data("block", "Please verify you actually typed a message.");


  $("#comment_comment,  textarea[id^='comment_reply_field_']").keypress( function(){
    if($(this).val() != ''){
      $(this).closest('form').removeData("block");
    }else{
      $(this).closest('form').data("block", "Please verify you actually typed a message.");
    };
  });
  $('.new_reply, #new_comment').ajaxSubmit();

  $('#comment_comment').focus( function(){
    if (jQuery(this).data('alreadyChanged')){
      return true;
    } else {
      jQuery(this).data('alreadyChanged', true).val('');
      return true;
    }
  });

  // Search cell input select stuff
  jQuery('#cell-search select#search_type').change(function(){
    jQuery(this).closest('form').attr('action', '/' + jQuery(this).val());
  });


  // Make comment pagination load via ajax
  jQuery('#comments_and_pager div.pagination a').live('click', function(){
    // Avoid double clicks
    if(jQuery(this).parent().data('beenSubmitted') != null){
      return false;
    } else {
      jQuery(this).parent().data('beenSubmitted', true);
    };

    // Grab variables
    pagination_div = jQuery('div.pagination');
    commentableId = jQuery('input#comment_commentable_id').val();
    commentableType = jQuery('input#comment_commentable_type').val();
    commentableControllerName = jQuery('input#commentable_controller_name').val();
    clickText = jQuery(this).text();

    // determine the new page number we want
    if(clickText.match(/Previous/)){
      page = parseInt(jQuery('input#current_page').val()) - 1;
    } else if(clickText.match(/Next/)){
      page = parseInt(jQuery('input#current_page').val()) + 1;
    } else {
      page = parseInt(clickText);
    }

    // Make an ajax call and replace the comments_and_page div with results
    pagination_div.append('<img src="/images/kajabi-ajax-loader.gif" style="padding-left: 10px;"/>');
    jQuery.get('/' + commentableControllerName + '/' + commentableId + '/paged_comments/?page=' + page, function(data){
      jQuery('#comments_and_pager').fadeTo('fast', 0.3, function(){
        jQuery('input#current_page').val(page);
        jQuery(this).replaceWith(data);
        if (jQuery('div.pagination')){
          jQuery.scrollTo('div.pagination');
        };
      });
    }, null, "html");
    return false;
  });

  var swapStateDropdownWithEditBox = function() {
    var country_select = jQuery('#credit_card_billing_country');

    if(country_select.val() == "US") {
      var state_field = jQuery('#credit_card_billing_state');
      if(state_field) {
        state_field.replaceWith(unescape(us_state_select));
      }
    } else {
      changeStateToTextField();
    }

    return false;
  };

  var changeStateToTextField = function() {
    var state_field = jQuery('#credit_card_billing_state');
    if(state_field) {
      state_field.replaceWith('<input id="credit_card_billing_state" name="credit_card[billing_state]" size="30" type="text"/>');
      jQuery('#non_us_state').remove();
    }

    return false;
  };

  if(jQuery('textarea.resize').length > 0) {
    jQuery('textarea.resize').autoResize({
        // Quite slow animation:
        animateDuration : 150,
        // More extra space:
        extraSpace : 0
    });
  }


});

var Kajabi = Kajabi || {};

(function($){
  Kajabi.StorageInfo = {
    context: function(url, key) {
      return {
        get: function(attr, callback) {
          var info = $.parseJSON($.cookie(key)),
              val = info[attr];

          if (typeof(val) === "string") {
            val = decodeURIComponent(val);
          }

          callback(val);
        }
      };
    }
  };

  Kajabi.userInfo = function() {
    return Kajabi.StorageInfo.context("/user_profile_info", "user_profile_info");
  };
})(jQuery);
