// Generated by CoffeeScript 1.6.2
(function() {
  var ChatModel, ChatView, SlideModel, SlideView, scrollLock, setStatus, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  setStatus = function(msg) {
    return $("#status").html(msg);
  };

  SlideModel = (function(_super) {
    __extends(SlideModel, _super);

    function SlideModel() {
      _ref = SlideModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return SlideModel;

  })(Backbone.Model);

  SlideView = (function(_super) {
    __extends(SlideView, _super);

    function SlideView() {
      this.render = __bind(this.render, this);      _ref1 = SlideView.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    SlideView.prototype.el = $('#slides-div');

    SlideView.prototype.events = {};

    SlideView.prototype.initialize = function() {
      this.model.on('change', this.render);
      return this.model.view = this;
    };

    SlideView.prototype.render = function() {
      var id;

      id = this.model.get('id');
      $('#slides-div .slide:visible').hide();
      return $('#slides-div .slide:eq(' + id + ')').show();
    };

    return SlideView;

  })(Backbone.View);

  ChatModel = (function(_super) {
    __extends(ChatModel, _super);

    function ChatModel() {
      _ref2 = ChatModel.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    return ChatModel;

  })(Backbone.Model);

  ChatView = (function(_super) {
    __extends(ChatView, _super);

    function ChatView() {
      this.render = __bind(this.render, this);      _ref3 = ChatView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    ChatView.prototype.el = $('#chat-div');

    ChatView.prototype.events = {
      'submit form': 'onFormSubmit'
    };

    ChatView.prototype.initialize = function() {
      this.model.on('change', this.render);
      return this.model.view = this;
    };

    ChatView.prototype.render = function() {
      var msgs, msgsDiv, template;

      msgsDiv = this.$el.find(".msgs");
      msgs = this.model.get("msgs");
      template = $('#template-msg').html();
      if (!this.model.get('append')) {
        msgs.reverse();
        return $.each(msgs, function(idx, msg) {
          var html;

          if (msgsDiv.find('.msg[data-id="' + msg.id + '"]').length <= 0) {
            html = Mustache.render(template, msg);
            return msgsDiv.prepend(html);
          }
        });
      } else {
        return $.each(msgs, function(idx, msg) {
          var html;

          if (msgsDiv.find('.msg[data-id="' + msg.id + '"]').length <= 0) {
            html = Mustache.render(template, msg);
            return msgsDiv.append(html);
          }
        });
      }
    };

    ChatView.prototype.onFormSubmit = function() {
      var form, msg;

      form = this.$el.find('form');
      msg = form.find('input[name="msg"]').val();
      form.find('input[name="msg"]').val('');
      if (msg.length <= 0) {
        return false;
      }
      this.socket.emit("chat", {
        msg: msg
      });
      return false;
    };

    return ChatView;

  })(Backbone.View);

  scrollLock = false;

  $(document).ready(function() {
    var chatModel, chatView, slideModel, slideView, socket;

    hljs.initHighlightingOnLoad();
    $('pre code').each(function(i, e) {
      return hljs.highlightBlock(e);
    });
    slideModel = new SlideModel();
    slideView = new SlideView({
      model: slideModel
    });
    slideModel.set({
      channel: 'slide',
      id: 0
    });
    chatModel = new ChatModel();
    chatView = new ChatView({
      model: chatModel
    });
    socket = io.connect("http://" + location.hostname + ":" + config.port);
    chatView.socket = socket;
    socket.on("connect", function(data) {
      setStatus("connected");
      socket.emit("subscribe", {
        channel: "slide"
      });
      return socket.emit("subscribe", {
        channel: "chat"
      });
    });
    socket.on("reconnecting", function(data) {
      return setStatus("reconnecting");
    });
    socket.on("slide", function(data) {
      var numSlides;

      numSlides = $('#slides-div .slide').length;
      if ((data.id != null) && data.id < numSlides && data.id >= 0) {
        return slideModel.set(data);
      }
    });
    socket.on("chat", function(data) {
      return chatModel.set({
        msgs: data,
        random: Math.random(),
        append: false
      });
    });
    socket.on("chat-append", function(data) {
      chatModel.set({
        msgs: data,
        random: Math.random(),
        append: true
      });
      return scrollLock = false;
    });
    socket.on("prize", function(data) {
      return $('#prize-div').text(data);
    });
    return $(document).bind("scroll", function() {
      var id, lastMsg;

      if (!scrollLock && $(document).height() - $(window).scrollTop() - $(window).height() < 300) {
        lastMsg = $('#chat-div .msg:last');
        if (lastMsg.length > 0) {
          scrollLock = true;
          id = lastMsg.data("id") - 1;
          if (id > 0) {
            return socket.emit("chat-append", {
              id: lastMsg.data("id")
            });
          }
        }
      }
    });
  });

}).call(this);
