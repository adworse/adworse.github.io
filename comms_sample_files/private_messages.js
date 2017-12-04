var PrivateMessaging = {};

window.PrivateMessageStatus = Backbone.Model.extend({
  urlRoot: "/private_messages_statuses",

  initialize: function() {
    this.set({"ids" : []});
  },

  addId: function(id) {
    var ids = this.get("ids");
    ids.push(id);
    this.setIds(ids);
  },

  setIds: function(ids) {
    this.set({"ids" : ids});
  },

  markIdsRead: function(ids) {
    this.setIds(ids);
    this.save();
  }
});

window.PrivateMessage = Backbone.Model.extend({
  urlRoot: "/private_messages",

  defaults: {
    sender_name: "Unknown",
    avatar_url: "http://www.kajabi.com/images/avatars/default/tiny.png",
    currentUserOwned: false,
    timestamp: function() {
      return new Date().toUsShortDateString();
    }
  },

  currentUserOwned: function(){
    return PrivateMessaging.currentUserId === this.get("sender_id");
  },

  markedNew: function(){
    return this.get("newlyReceived") === "true";
  },

  setOldTop: function() {
    this.set({"old_top": true});
  },

  markForEdit: function() {
    this.editing = true;
  },

  unmarkForEdit: function() {
    this.editing = false;
  },

  currentlyEditing: function() {
    return this.editing;
  },

  flagForHighlight: function() {
    this.set({"doHighlight" : "true"}, { silent: true});
  },

  resetHighlightFlag: function() {
    this.set({"doHighlight" : "false"}, { silent: true});
  },

  doHighlight: function() {
    return this.get("doHighlight") === "true";
  },

  sentToCurrentUser: function() {
    return PrivateMessaging.currentUserId === this.get("receiver_id");
  },

  markRead: function() {
    this.set({ 'flag_unread' : false })
  },

  markUnread: function() {
    this.set({ 'flag_unread' : true })
  }
});

window.InboxMessage = PrivateMessage.extend({
  directionHint: function() {
    return [this.directionHintParty(), this.directionHintAction()].join(" ");
  },

  directionHintParty: function() {
    if (this.sentToCurrentUser()) {
      return "they";
    } else {
      return "you";
    }
  },

  directionHintAction: function() {
    if (this.get("toplevel")) {
      return "wrote";
    } else {
      return "replied";
    }
  },

  setDirectionHint: function(receiver_id) {
    this.set({"receiver_id": receiver_id}, { silent: true });
    this.set({"direction_hint": this.directionHint()}, { silent: true });
  },

  flagForUpdate: function(receiver_id) {
    this.flagForHighlight();
    this.setDirectionHint(receiver_id);
  }
});

window.ReplyMessage = PrivateMessage.extend({
});

window.PrivateMessageCollection = Backbone.Collection.extend({
  model: PrivateMessage,

  urlRoot: "/private_messages",

  comparator: function(reply) {
    return reply.get("last_activity_at") * -1;
  },

  newlyArrivedCount: function() {
    // Replace this with inject/reduce
    return _.select(this.models, function(reply){
      return reply.markedNew();
    }).length;
  },

  displayNew: function() {
    var idsToMarkRead = [];

    _.map(this.models, function(reply){
      if(!reply.markedNew()) {
        reply.markRead();
      }
    });

    var replies = _.select(this.models, function(reply){
      return reply.markedNew();
    });

    _.map(replies, function(reply){
      reply.flagForHighlight();
      reply.set({"newlyReceived": "false"});
      idsToMarkRead.push(reply.get("id"));
    });

    this.postDisplayNew(idsToMarkRead);
  },

  postDisplayNew: function(ids) {
    this.markIdsRead(ids);
  },

  markIdsRead: function(ids) {
    var privateMessageStatus = new PrivateMessageStatus();
    privateMessageStatus.markIdsRead(ids);
  }
});

window.InboxCollection = PrivateMessageCollection.extend({
  model: InboxMessage,

  inboxReception: function(privateMessage) {
    var existingMessage, party,
        tmpMessage = new InboxMessage(privateMessage);

    privateMessage.newlyReceived = "true";
    if (_.isNull(privateMessage.parent_id)) {
      privateMessage.flag_unread = true;
      this.add(privateMessage);
    } else {
      existingMessage = this.get(privateMessage.parent_id);
      existingMessage.flagForUpdate(privateMessage.receiver_id);
      existingMessage.set({
        "flag_unread": true,
        "body": privateMessage.body,
        "timestamp": privateMessage.timestamp
      });
    }
  },

  postDisplayNew: function(ids) {
    return;
  }
});

window.RepliesCollection = PrivateMessageCollection.extend({
  model: ReplyMessage,

  addNewlyReceived: function(reply) {
    if (PrivateMessaging.parentId === reply.parent_id) {
      reply.newlyReceived = "true";
      reply.flag_unread = true;
      this.add(reply);
    }
  },

  comparator: function(reply) {
    return reply.get("id") * -1;
  },
  markAllRead: function() {
    _.map(this.models, function(model) {
      model.markRead();
    });
  }
});

window.NewReplyView = Backbone.View.extend({
  events: {
    "click .send-message" : "sendAndMarkRead",
    "click .cancel-message" : "cancelMessage"
  },

  sendMessage: function(e) {
    e.preventDefault();

    var attributes = {
      sender_name: PrivateMessaging.currentUserName,
      sender_id : PrivateMessaging.currentUserId,
      parent_id : PrivateMessaging.parentId,
      receiver_id : PrivateMessaging.otherPartyId,
      body : $(this.el).find("textarea").val(),
      avatar_url : PrivateMessaging.currentUserAvatarUrl
    };

    var newReply = replies.create(attributes);
    this.blankTextArea();
    return newReply;
  },

  cancelMessage: function(e) {
    e.preventDefault();
    this.blankTextArea();
  },

  blankTextArea: function() {
    $(this.el).find('textarea').val('');
  },
  sendAndMarkRead: function(e) {
    this.sendMessage(e);
    replies.markAllRead();
  }
});

window.NewMessageView = NewReplyView.extend({
  events: {
    "click .send-message" : "hideAndSend",
    "click .cancel-message" : "hideAndCancel"
  },

  sendMessage: function(e, successFunction) {
    e.preventDefault();
    if (this.sending) { return; }
    this.sending = true;

    var attributes = {
      sender_name: PrivateMessaging.currentUserName,
      sender_id : PrivateMessaging.currentUserId,
      parent_id : PrivateMessaging.parentId,
      receiver_id : PrivateMessaging.otherPartyId,
      body : $(this.el).find("textarea").val(),
      avatar_url : PrivateMessaging.currentUserAvatarUrl
    };

    var newMessage = new PrivateMessage(attributes);
    var self = this;
    newMessage.save({}, {
      success : function(){ 
        self.sending = false;
        self.blankTextArea();
        self.renderFlashNotice(newMessage);
        if (_.isFunction(successFunction)) {
          successFunction();
        }
        return newMessage;
      },

      error : function() {
        self.sending = false;
        self.renderFlashError(newMessage);
      }
    });
  },

  renderFlashNotice: function(privateMessage) {
    new NewMessageFlashNoticeView({ model: privateMessage }).render();
  },

  renderFlashError: function(privateMessage) {
    new NewMessageFlashErrorView({ model: privateMessage }).render();
  },

  hideAndSend: function(e) {
    var self = this;
    this.sendMessage(e, function(){
      self.hide();
    });
  },

  hideAndCancel: function(e) {
    this.cancelMessage(e);
    this.hide();
  },

  hide: function() {
    $(this.el).fadeOut('fast', function(){
      $('.send-new-message').removeClass('hide').show();
    });
  },

  show: function() {
    $(this.el).removeClass('hide').fadeIn('fast');
    $('.send-new-message').hide();
  }
});

window.NewMessageFlashView = Backbone.View.extend({
  getInsertPoint: function(){
    return $('div[class^=main-column]');
  },

  initialize: function(){
    _.bindAll(this, "render");
  },

  makeFlashDiv: function() {
    throw "Abstract Method";
  },

  render: function() {
    var flash = this.makeFlashDiv();
    flash.html(_.template(this.template, this.model.toJSON()));
    this.clearFlash();
    this.getInsertPoint().prepend(flash);
  },

  clearFlash: function() {
    $('div[id^=flash_]').remove();
  }
});

window.NewMessageFlashNoticeView = NewMessageFlashView.extend({
  template: 'Your message has been sent. <a href="/private_messages/<%= id %>">View message</a>',

  makeFlashDiv: function() {
    return $("<div>", { id : "flash_notice" });
  }
});

window.NewMessageFlashErrorView = NewMessageFlashView.extend({
  template: 'An error has occurred, please try again',

  makeFlashDiv: function() {
    return $("<div>", { id : "flash_error" });
  }
});

window.ReplyView = Backbone.View.extend({
  tagName: "li",

  className: "reply",

  events: {
    "mouseover .inner" : "actionsOn",
    "mouseout .inner" : "actionsOff",
    "click .edit" : "edit",
    "click .cancel-edit" : "cancelEdit",
    "click .update-edit" : "update",
    "click .delete" : "clear",
    "click .pm_user_link" : "pmUserLink"
  },

  initialize: function(){
    replies.bind("change:old_top", this.markOldTop, this);
    this.model.bind("change", this.render, this);
    this.model.bind('destroy', this.remove, this);
    this.model.view = this;
  },

  simpleFormat: function(str) {
  var simpleFormatRE1 = /\r\n?/g;
  var simpleFormatRE2 = /\n\n+/g;
  var simpleFormatRE3 = /([^\n]\n)(?=[^\n])/g;
    var fstr = str;
    fstr = fstr.replace(simpleFormatRE1, "\n");
    fstr = fstr.replace(simpleFormatRE2, "</p>\n\n<p>");
    fstr = fstr.replace(simpleFormatRE3, "$1<br/>");
    fstr = "<p>" + fstr + "</p>";
    return fstr;
  },
  
  render: function() {
    var attributes = this.model.toJSON();
    attributes.currentUserOwned = attributes.sender_id === PrivateMessaging.currentUserId;
    attributes.formatted_body = this.simpleFormat(attributes.body);
    $(this.el).html(ich.private_message(attributes));

    if (this.model.get("newlyReceived") === "true") {
      $(this.el).addClass('hidden');
    } else {
      $(this.el).removeClass('hidden');
    }

    if (this.model.get("flag_unread")) {
      $(this.el).addClass("unread");
    } else {
      $(this.el).removeClass("unread");
    }

    if (this.model.get("toplevel")) {
      $(this.el).removeClass('has_replies');
    } else {
      $(this.el).addClass('has_replies');
    }

    if (this.model.doHighlight()) {
      this.model.resetHighlightFlag();
      $(this.el).effect("highlight", {}, 3000);
    }

    return this;
  },

  markOldTop: function(reply) {
    if(this.model.get("old_top") && this.model === reply) {
      $(this.el).addClass('old-top');
    } else {
      $(this.el).removeClass('old-top');
    }
  },

  actionsOn: function() {
    if (this.model.currentlyEditing()) { return; }

    if (this.$('.actions').hasClass("hidden")) {
      this.$('.actions').removeClass("hidden");
    }
  },

  actionsOff: function() {
    if ( ! this.$('.actions').hasClass("hidden") ) {
      this.$('.actions').addClass("hidden");
    }
  },

  remove: function() {
    $(this.el).fadeOut(function(){
      $(this).remove();
    });
  },

  edit: function(e) {
    e.preventDefault();
    this.model.markForEdit();
    this.$('.actions').addClass("hidden");
    $(this.el).find('.body').replaceWith(ich.edit_area(this.model.toJSON()));
  },

  cancelEdit: function(e) {
    e.preventDefault();
    this.model.unmarkForEdit();
    this.render();
  },

  update: function(e) {
    e.preventDefault();
    this.model.unmarkForEdit();
    this.model.set({"body" : $(this.el).find('textarea').val() }, { silent : false});
    this.model.save();
  },

  clear: function(e) {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this message?")) {
      this.model.destroy();
    }
  },

  // Block links to truly nil users
  pmUserLink: function(e) {
    if (_.isNull(this.model.get('sender_id'))) {
      e.preventDefault();
    }
  },

  menu: function() {
    var html = $('<div>', { "class": "menu", html: this.replyMenuView.render().el });
    this.$('.action').after(html);
  }
});

window.PrivateMessageView = ReplyView.extend({
  events: {
    "click .inner": "showMessage"
  },

  initialize: function(){
    this.model.bind("change", this.render, this);
    this.model.bind('destroy', this.remove, this);
    this.model.view = this;
  },

  showMessage: function(){
    window.location = "/private_messages/" + this.model.get("id");
  }
});

window.NewArrivalsView = Backbone.View.extend({
  events: {
    "click .display_new" : "displayNew"
  },

  initialize: function() {
    _.bindAll(this, "render");
    this.observeCollection().bind("add", this.handleArrival, this);
    this.observeCollection().bind("change", this.handleArrival, this);
  },

  render: function(reply) {
    var count = this.observeCollection().newlyArrivedCount();
    var messageWord = "message";
    if (count > 1) { messageWord = messageWord + "s"; }
    var message = count + " new " + messageWord;
    message = message + " from " + reply.get("sender_name");
    message = message + '.  <a href="#" class="display_new">Show ' + messageWord + '.</a>';
    $(this.el).html(message);
    $(this.el).removeClass('hidden');

    return this;
  },

  handleArrival: function(reply) {
    if (this.observeCollection().newlyArrivedCount() > 0) {
      this.render(reply);
    } else {
      $(this.el).addClass('hidden');
    }
  },

  displayNew: function(e) {
    e.preventDefault();
    this.observeCollection().displayNew();
  }
});

window.ReplyArrivalsView = NewArrivalsView.extend({
  observeCollection: function(){
    return replies;
  }
});

window.InboxArrivalsView = NewArrivalsView.extend({
  observeCollection: function(){
    return privateMessages;
  }
});

window.PrivateMessagesView = Backbone.View.extend({
  initialize: function() {
    privateMessages.bind("add", this.addMessage, this);
  },

  addMessage: function(privateMessage) {
    var view = new PrivateMessageView({ model: privateMessage });
    $(this.el).prepend(view.render().el);
  }
});

window.RepliesView = Backbone.View.extend({
  initialize: function() {
    replies.bind("add", this.addReply, this);
  },

  addReply: function(reply) {
    var view = new ReplyView({ model: reply });
    $(this.el).prepend(view.render().el);
  }
});
