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
var Stull = {
  args: [],
  init: function(opts, cb){
    var _this = this;
    Hull.init({ 
      orgUrl: opts.orgurl, 
      appId: opts.appid
    }, function(){
      // on success, save arguments (hull, me, app, org)
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
var Settings = {
  json: {},
  opts: {},

  fetch: function(opts, cb){

    // save current options
    this.buildOpts(opts);

    var settings = Stull.args[2].extra;

    // for each entry in settings
    for(var key in settings){
      var val = settings[key];
      var isMatching = key.match(this.opts.pattern) !== null;

      // if current entry match with the pattern
      // or if there's no pattern (pattern == 'null') push entry into the main json
      // NB: use 'null' and not null, because it's a data-attribute
      if(this.opts.pattern === 'null' || isMatching)
        this.json[key] = val;
    }

    if(cb) cb(this.json);
  },
  display: function(){
    var $model = this.opts.$model;

    // for each entry in main json created into Settings.fetch()
    for(var entry in this.json){
      var val = this.json[entry];

      // clone $model to avoid conflicts
      $model = $model.clone();

      // if there's a pattern, scope entry key
      if(this.opts.pattern !== 'null')
        entry = entry.split(this.opts.pattern)[1];

      // put attributes in the label
      $model
        .find('label')
        .attr('for', entry)
        .html(entry);

      // put attributes in the input
      $model
        .find('input')
        .attr({
          name: entry,
          id: entry,
          value: val
        });

      // display in client page
      $model.appendTo(this.opts.$container);
    }

    // reset objects
    this.json = {};
    this.opts = {};
  },
  buildOpts: function(opts){
    // for each options passsed
    // build a main json object
    for(var option in opts){
      this.opts[option] = opts[option];
    }
  }
};

Notify.init();
