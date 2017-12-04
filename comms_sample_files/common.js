/*
  Object.create will be able in ES5, but for now...
  http://javascript.crockford.com/prototypal.html
  
  Example usage:
  newObject = Object.create(oldObject);
*/

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Kajabi Global Object, for storing globals to avoid namespace collisions
var Kajabi = {};

/*
  AJAX Functions
*/
jQuery.ajaxSetup({
  'beforeSend': function(xhr) {
    xhr.setRequestHeader("Accept", "text/javascript");
  }
});

jQuery.fn.ajaxSubmit = function (preFunc) {
  this.live('submit', function(e) {
    if(typeof(preFunc) == 'function'){
      preFunc();
    }

    if(jQuery(this).data("block") != null){
      alert(jQuery(this).data("block"));
      return false;
    } else {
      if (this.beenSubmitted !== undefined && e.timeStamp - this.beenSubmitted < 2000) {
        return false;
      } else {
        this.beenSubmitted = e.timeStamp;
        jQuery.wait();
        jQuery.post(this.action, jQuery(this).serialize(), null, "script");
        return false;
      }
    }
  }).ajaxError(function(){
    jQuery.ready();
    jQuery.showAlert('Sorry, an error occurred with your request, please try again.', 'failure');
  });
};

jQuery.fn.postClickWithAjax = function(doConfirm, actionType) {
  this.live('click', function() {
    if(actionType == null){ actionType = "click"; }
    if (doConfirm === true && !confirm("Are you sure you want to " + actionType + " this?")){
      return false;
    }

    jQuery.wait();
    jQuery.post(this.href, null, null, "script");
    return false;
  });
};

jQuery.fn.ajaxCreate = function(doConfirm, actionType) {
  this.live('click', function() {
    if(actionType == null){ actionType = "create"; }
    if (doConfirm === true && !confirm("Are you sure you want to " + actionType + " this?")){
      return false;
    }

    jQuery.wait();
      jQuery.post(this.href, null, null, "script");
      return false;
    });
};

jQuery.fn.ajaxDestroy = function(doConfirm, actionType, postFunc) {
  this.live('click', function() {
    if(actionType == null){ actionType = "delete"; }
    if (doConfirm === true && !confirm("Are you sure you want to " + actionType + " this?")){
      return false;
    }

    jQuery.wait();
    jQuery.ajax({
      url:          this.href,
      type:         'post',
      dataType:       'script',
      data:           { '_method' : 'delete' }
    });

    if(typeof(postFunc) == 'function'){
      postFunc();
    }

    return false;
    });
};

jQuery.fn.ajaxGet = function() {
  this.live('click', function() {
    jQuery.wait();
      jQuery.ajax({
      url:    this.href,
      type:   'get',
      dataType: 'script'
    });
      return false;
    });
  return this;
};


/*
  Form Element Functions
*/

jQuery.fn.dropdown = function() {
  this.live('click', function() {
    jQuery(this).next('.dd_container').slideDown('slow');
    jQuery(this).css('backgroundColor', '#D4E7F9');
  });
};

jQuery.fn.initFileUploads = function() {
  this.each(function() {
    var id = jQuery(this).find('input.file').attr('id');
    jQuery(this).append('<div class="fakefile"><input class="catcher" /><button class="file_browser">Browse</browse></div>');
    jQuery("#"+ id).change(function(){
      jQuery(this).next().find('input').val(jQuery("#" + id).val());
    });
  });
};

jQuery.select_all = function(){
  var mode = this.mode == 'off' ? 'on' : 'off';
    this.mode = mode;

   jQuery(".c_box").each(function(){
        mode == 'off' ? this.checked = true : this.checked = false;
    });
    return false;
};


jQuery.fn.labelOver = function(overClass) {
  return this.each(function(){
    var label = jQuery(this);
    var f = label.attr('for');
    if (f) {
      var input = jQuery('#' + f);

      this.hide = function() {
        label.css({ textIndent: -10000 });
      };

      this.show = function() {
        if (input.val() === '') { label.css({ textIndent: 0 }); }
      };
      // handlers
      input.focus(this.hide);
      input.blur(this.show);
      label.addClass(overClass).click(function(){ input.focus(); });

      if (input.val() !== '') { this.hide(); }
    }
  });
};


/*
  Utilities
*/

jQuery.wait = function () {
  jQuery('#smoke_screen').fadeIn('fast', function(){
    jQuery('#waiting').show();
  });
};

jQuery.ready = function () {
  jQuery('#waiting').hide();
  jQuery('#smoke_screen').fadeOut('fast');
};

jQuery.showAlert = function(text, type, count){
  jQuery('#alert_window').addClass('alert_' + type);
  if (typeof count == "undefined"){
    jQuery('#alert_window').html('<div id="alert_msg">' + text + '</div><a href="#" id="hide_alert_window">Hide</a>');
  } else{
    jQuery('#alert_window').html('<div id="alert_msg"><span style="font-weight:bold;">' + count + '</span> ' + text + '</div><a href="#" id="hide_alert_window">Hide</a>');
  }
  jQuery('#alert_window').fadeIn('fast', function(){
    jQuery(this).delay(4000);
    jQuery(this).fadeOut(1000, function(){
      jQuery(this).removeClass();
      jQuery(this).html('');
    });
  });
};

jQuery.updateCount = function(element, text){
  jQuery(element).fadeOut('fast');

  raw_count = jQuery(element).text();
  string_count = raw_count.split(' ' + text);
  count = parseInt(string_count[0], 10) + 1;
  new_count = count + ' ' + text;
  jQuery(element).html(new_count);

  jQuery(element).fadeIn();
};


/*
  Qtip
*/

var sharedQtipOptions = {
  style: 'form_callout',
  position: {
    corner: {
      target: 'rightMiddle',
      tooltip: 'leftMiddle'
    },
    adjust: {
      x: 13,
      y: 0
    }
  }
};

jQuery.myQtipHelp = function(selector, helpMessage) {
  jQuery(selector).qtip(jQuery.extend({
    show: 'mouseover',
    hide: 'mouseout',
    content: helpMessage
  }, sharedQtipOptions));
};

jQuery.myQtipHelpLive = function(selector, helpMessage) {
  jQuery(selector).live('mouseover', function(){
    jQuery(this).qtip(jQuery.extend({
      overwrite: false,
      show: {
        ready: true
      },
      content: helpMessage
    }, sharedQtipOptions));
  });
};

jQuery.zindexNextSibling = function(elem, mySelector, siblingSelector) {
  if (typeof(siblingSelector) == 'undefined') var siblingSelector = mySelector;

  $(elem).closest(mySelector).css('z-index', '8999').find('*').each(function(){
    $(this).css('z-index', '8999');
  }).end().nextAll(siblingSelector).first().css('z-index', '7999').find('*').each(function(){
    $(this).css('z-index', '7999');
  });
};

jQuery(function($){
  $('#hide_alert_window').live('click', function(){
    $('#alert_window').hide();
    return false;
  });

  $('div[id^=flash_] a.close').live('click', function(e){
    e.preventDefault();
    $(this).closest('div[id^=flash_]').fadeOut('slow', function(){
      $(this).remove();
    });
  });

  $('.selected-reply-type-comment, .selected-reply-type-question, .selected-reply-type-suggestion, .selected-reply-type-answer').live('click',function(){
    // Set zindex for ie7 layering
    if ($(this).closest('div.update').length > 0) {
      jQuery.zindexNextSibling(this, 'div.update');
    } else {
      jQuery.zindexNextSibling(this, 'li[id^=comment_]');
    }

    $(this).next('.reply-type-selector-menu').fadeIn('fast', function(){
      var closer = $(this);
      $('body').click(function(e){
        if ($(closer).is(":visible") && e.target.className.match(/selected-reply-type/)) {
          e.stopPropagation();
        }
        $(closer).hide();
        $('body').unbind('click');
        closer = null;
      });
    });
  });

  $('.reply-type-selector-menu>[class^=menu-item-]').live('click', function(e){
    e.stopPropagation();
    var type_raw = $(this).attr('id').split('reply_');
    var type = type_raw[1].split('_');
    var formattedType = type[0].charAt(0).toUpperCase() + type[0].slice(1);

    $('#category_' + type[1]).val(formattedType);
    $(this).closest('div').children('div').removeClass().addClass('selected-reply-type-' + type[0]);
    $(this).closest('ul').fadeOut('fast');
  });

  $('li.full-clickable').click(function(){
    location.href = $(this).find("a").attr("href");
    return false;
  });

  var loadNewStateOptions = function() {
    var country = jQuery(this).val();
    var state_field = jQuery('#credit_card_billing_state');
    jQuery.get('/signup/change_country?country=' + country, function(data) {
      state_field.replaceWith(data);
    });
  }

  jQuery('#credit_card_billing_country').change(loadNewStateOptions);
});

jQuery(function($){
  // Old skool Watermark functionality
  $("input.watermark").each(function(){
    $(this).data('defaultValue',$(this).val());
    $(this).data('defaultType',$(this).attr('type'));
    if($(this).data('defaultType') == 'password') {
      $(this).attr('type','text');    
    }
    $(this).focus(function(){
      if($(this).val() === $(this).data('defaultValue'))	{
        $(this).val('');
        $(this).removeClass('watermark-grey');
      }

     }).blur(function() {
       if($(this).val() === '') {
        $(this).val($(this).data('defaultValue'));
        if($(this).hasClass('watermark-faded')) {
          $(this).addClass('watermark-grey');
        }
      }
     });
  });

  // Global External Links
  $("body").on("click", "a[rel=external]", function(e) {
    e.preventDefault();
    window.open(this.href, "_blank");
  })
  
  // Global Jump Menu functionality
  $(".jumpmenu").change(function() {
    var val = $(this).children('option:selected').val();
    if (val != '') {
      //console.log(val)
      location.href=val;
    }   
  });

  // Class links in a fancybox with modal-link to
  // get them to close and nav
  $("a.modal-link").click(function(e){
    e.preventDefault();
    parent.$.fancybox.close();
    parent.location.href = this.href;
  });

  $("textarea[maxlength].maxlength").on("keypress", function(e){
    var $self = $(this);
    var maxLength = parseInt($self.attr('maxlength'), 10);

    if ($self.val().length > maxLength) {
      e.preventDefault();
    }
  });
});

(function($) {
  $(function() {
    // $("input.time_distance_ui").timeDistanceUI();
  });
})(jQuery);
