var Message = Backbone.Model.extend({
  // url: 'https://api.parse.com/1/classes/chatterbox/',
  url: 'http://127.0.0.1:3000/classes/messages',
  initialize: function(message) {
    this.set({'text': _.escape(message.text),
      'username': _.escape(message.username),
      'id':message.objectId});
  },

  defaults: {
    'username': 'anonymous'
  }
});

var Messages = Backbone.Collection.extend({
  // url: 'https://api.parse.com/1/classes/chatterbox/',
  url: 'http://127.0.0.1:3000/classes/messages',
  model: Message,

  loadMessages: function() {
    //this.fetch({data: { order: '-createdAt'}});
    this.fetch();
  },

  parse: function(response, options) {
    console.log(response);
    var results = [];
    for (var i = response.results.length-1; i >= 0; i--) {
      results.push(response.results[i]);
    }
    return results;
  }
});

var MessageView = Backbone.View.extend({
  template: _.template('<div class="chat"> \
                        <div class="username"><%- username %></div> \
                        <div class="text"><%- text %></div> \
                        </div>'),

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

var MessagesView = Backbone.View.extend({
  initialize: function () {
    this.collection.on('sync', this.render, this);
    this.onscreenMessages = {};
  },

  render: function () {
    this.$el.empty();
    this.collection.forEach(this.renderMessage, this);

  },

  renderMessage: function(message) {
    //if (!this.onscreenMessages[message.get('objectId')]) {
    var messageView = new MessageView({model: message});
    this.$el.prepend(messageView.render());
    this.onscreenMessages[message.get('objectId')] = true;
    //}
  }

});

var FormView = Backbone.View.extend({

  initialize: function () {
    this.collection.on('sync', this.stopSpinner, this);
  },

  events : { 'submit #send' : 'handleSubmit'},

  handleSubmit: function (event) {
    event.preventDefault();

    this.startSpinner();

    var $text = this.$('#message');
    this.collection.create({
      username: window.location.search.substr(10),
      text: $text.val()
    });
    $text.val('');
  },

  startSpinner: function(){
    this.$('.spinner img').show();
    this.$('form input[type=submit]').attr('disabled', "true");
  },

  stopSpinner: function(){
    this.$('.spinner img').fadeOut('fast');
    this.$('form input[type=submit]').attr('disabled', null);
  }



});


$(function() {

  window.messages = new Messages();
  window.messages.loadMessages();
  var messagesView = new MessagesView({el: $('#chats'), collection: window.messages});
  var formView = new FormView({ el: $('#main'), collection: window.messages});
  setInterval(window.messages.loadMessages.bind(window.messages), 10000);

});




