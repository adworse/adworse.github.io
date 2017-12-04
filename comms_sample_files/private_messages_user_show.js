jQuery(function(){
  ich.refresh();
  var newMessageView = new NewMessageView({el: $('.message-area')});
  $('.send-new-message').click(function(e){
    e.preventDefault();
    newMessageView.show();
  });
});

