var Notify = {
  $el: $('.js-notif'),
  $toggler: $('.js-notif-toggler'),
  baseClasses: 'notif js-notif',
  outClass: 'fadeOutUp',
  inClass: 'fadeInDown',
  isBusy: false,

  init: function(){
    var _this = this;
    var $el = this.$el;

    this.$toggler.on('click', function(){
      var status = $(this).attr('data-status');
      var content = $(this).attr('data-content');
      _this.show(status, content);
    });

    $el.on('click', function(){
      _this.hide();
    });

    $el.bind('webkitAnimationEnd', function(e){
      if(e.animationName === _this.outClass)
        _this.hideCallback();
      else
        _this.showCallback();
    });
  },
  show: function(status, content){
    if(this.isBusy) return;
    this.isBusy = true;

    this.$el
      .attr('data-status', status)
      .html(content)
      .toggleClass(this.inClass+' hidden animated');
  },
  showCallback: function(){
    var _this = this;

    this.$el
      .attr('class', this.baseClasses);

    setTimeout(function(){
      var isStillShow = _this.$el.attr('data-status') !== null;
      if(isStillShow)
        _this.hide();
    }, 1500);
  },
  hide: function(){
    this.$el
      .addClass(this.outClass+ ' animated');
  },
  hideCallback: function(){
    this.$el
      .attr('class', this.baseClasses+ ' hidden')
      .removeAttr('data-status')
      .html('');

    this.isBusy = false;
  }
};

var _hull = {
  args: [],
  init: function(_orgurl, _appid, cb){
    var _this = this;
    Hull.init({ 
      orgUrl: _orgurl, 
      appId: _appid 
    }, function(){
      _this.saveArgs(arguments);
      if(cb) cb();
    });
  },
  saveArgs: function(args){
    var argSize = args.length;
    for(var i=0; i<argSize; i++){
      this.args.push(args[i]);
    }
  }
};

Notify.init();