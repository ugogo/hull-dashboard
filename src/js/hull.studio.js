var $body = $('body');
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
  },
  get: function(path){
    Hull.api(path, 'get').then(function(){
      $body.trigger({
        type:'stull-get--ok',
        _data: arguments
      });
    });
  }
};
var Settings = {
  json: {},
  opts: {},
  opts_default: (function(){
    return {
      display: false,
      pattern: 'null',
      $model: $('<div class="setting-container"><label></label><input /></div>'),
      $container: $('.js-settings-container'),
      $saveBtn: $('.js-settings-save'),
      $deleteBtn: $('.js-setting-drop'),
      $createBtn: $('.js-setting-create')
    };
  }),

  fetch: function(opts, cb){
    // start on a clean object
    this.json = {};

    // define options to use
    if(opts !== undefined){
      // use current options
      this.opts = this.buildOpts(opts);
    }
    else{
      // use default options
      this.opts = new this.opts_default();
    }

    var settings = Stull.args[2].extra;

    // for each entry in settings
    for(var key in settings){
      var val = settings[key];
      var isMatching = key.match(this.opts.pattern) !== null;

      // if current entry match with the pattern
      // or if there's no pattern (pattern == 'null') push entry into the main json
      // NB: use 'null' and not null, because it's a data-attribute
      if((this.opts.pattern === 'null' || isMatching) && val !== "null")
        this.json[key] = val;
    }

    if(this.opts.display)
      this.display();
    else
      return this.json;
  },
  display: function(){
    var $model = this.opts.$model;
    var $form = this.opts.$container.closest('form');

    // for each entry in main json
    // created into Settings.fetch()
    for(var entry in this.json){
      var val = this.json[entry];
      var originalEntry;

      // clone $model to avoid conflicts
      $model = $model.clone();

      // if there's a pattern, scope entry key
      if(this.opts.pattern !== 'null'){
        originalEntry = entry;
        entry = entry.split(this.opts.pattern)[1];
      }

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
          value: val,
          'data-binding-class': originalEntry || entry
        });

      // display in client page
      $model.appendTo(this.opts.$container);
    }

    // store data-pattern to the form
    $form.attr('data-pattern', this.opts.pattern);

    // active data-binding
    // for current $form
    var $inputs = $form.find('input');
    $inputs.on('keyup', function(){
      var $this = $(this);
      var _class = $this.attr('data-binding-class');
      var _value = $this.val();
      var $inputToBind = $('input[data-binding-class="'+ _class +'"]');

      $inputToBind.val(_value);
    });

    // reset objects
    this.json = {};
    this.opts = {};
  },
  buildOpts: function(opts){
    var _this = Settings;

    // create a new instance of default options
    var newOpts = new _this.opts_default();

    // for each options passsed, update in newOpts
    for(var option in opts){
      newOpts[option] = opts[option];
    }

    return newOpts;
  },
  init: function(opts){
    var _this = this;

    this.opts = new this.buildOpts(opts);

    // save settings
    this.opts.$saveBtn.on('click', function(e){
      e.preventDefault();
      _this.beforeSave(this);
    });

    // remove setting
    this.opts.$deleteBtn.live('click', function(e){
      e.preventDefault();
      var $this = $(this);
      var $input = $this.closest('fieldset').find('input');
      var bindingClass = $input.attr('data-binding-class');
      var $inputs = $('input[data-binding-class="'+ bindingClass +'"]');

      $inputs.forEach(function(el, i){
        _this.drop(el);
      });
    });

    // create setting
    this.opts.$createBtn.live('click', function(e){
      e.preventDefault();
      _this.create(this);
    });
  },
  beforeSave: function(el){
    var $this = $(el);
    var $form = $this.closest('form');
    var formDataPattern = $form.attr('data-pattern');
    var pattern = formDataPattern != 'null' ? formDataPattern : '';
    var entries = $form.serializeArray();
    var json = {};

    // for each form's entries
    // push it to the json
    entries.forEach(function(entry){
      json[pattern + entry.name] = entry.value;
    });

    // then push the json to Hull
    this.save(json);
  },
  save: function(json){
    Hull.api('app', 'put', {
      extra: json
    }).then(function(app) {
      $body.trigger({
        type: 'settings-save--success',
        _data: {
          app: app,
          json: json
        }
      });
    }, function(error) {
      $body.trigger({
        type: 'settings-save--fail',
        _data: error
      });
    });
  },
  drop: function(el){
    var $this = $(el);
    var $fieldset = $this.closest('fieldset');
    var $input = $fieldset.find('input');

    $input.val('null');
    $fieldset.addClass('none');
  },
  create: function(el){
    var $this = $(el);
    var $form = $this.closest('form');
    var formDataPattern = $form.attr('data-pattern');
    var pattern = formDataPattern != 'null' ? formDataPattern : '';
    var labelValue = pattern + prompt('Label ? '+ pattern);
    var keyValue = prompt('Value ?');
    var json = {};

    // remove spaces
    labelValue = labelValue.split(' ').join('-');

    // if labelValue and keyValue
    // are not empty, save
    if(labelValue && keyValue){
      json[labelValue] = keyValue;
      this.save(json);
    }
    else{
      $body.trigger('settings-create--fail');
    }
  }
};
var User = {
  get: function(key){
    if(this.isLogged())
      return key ? Hull.currentUser()[key] : Hull.currentUser();
    else
      return "You have to login";
  },
  isLogged: function(){
    return Hull.currentUser() ? true : false;
  },
  login: function(provider){
    // if there's no provider passed
    // notify an error
    if(!provider){
      $body.trigger('user-login--fail');
    }
    // if user isn't logged yet
    // login with the provider
    else if(!this.isLogged()){
      Hull.login(provider).then(function(user){
        $body.trigger({
          type: 'user-login--ok',
          _data: {
            user: user,
            provider: provider
          }
        });
      });
    }
    // if user is already logged
    // link identity
    else {
      Hull.linkIdentity(provider).then(function(user) {
        $body.trigger({
          type: 'user-linkidentity--success',
          _data: {
            user: user,
            provider: provider
          }
        });
      }, function(error) {
        $body.trigger({
          type: 'user-linkidentity--fail',
          _data: error
        });
      });
    }
  },
  logout: function(provider){
    // if no provider passed
    // just logout user
    if(!provider){
      Hull.logout().then(function(){
        $body.trigger('user-logout--success');
      });
    }
    else{
      Hull.unlinkIdentity(provider).then(function() {
        Notify.show('success', provider+' identity has been unlinked');
      }, function(error) {
        Notify.show('error', 'An error has occurred: '+ error.message);
      });
    }
  }
};

Notify.init();
