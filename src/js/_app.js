$(function(){

  var w = window;
  var sessionStorage = {
    get: function(key){
      var val = w.sessionStorage.getItem(key);
      return JSON.parse(val);
    },
    set: function(key, val){
      val = JSON.stringify(val);
      w.sessionStorage.setItem(key, val);
    }
  };


  var _hull = {
    $initSection: $('.js-init-section'),
    $loginSection: $('.js-login-section'),
    args: [],

    prepare: function(){
      var $form = $('.js-init-form');
      var $orgurl = $form.find('.js-init-orgurl');
      var $appid = $form.find('.js-init-appid');

      $form.on('submit', function(e){
        e.preventDefault();
        var _orgurl = $orgurl.val();
        var _appid = $appid.val();

        // store vals
        sessionStorage.set('_hull_appid', _appid);
        sessionStorage.set('_hull_orgurl', _orgurl);

        // init Hull
        _hull.init(_orgurl, _appid);
      });
    },
    init: function(_orgurl, _appid){
      Hull.init({ 
        orgUrl: _orgurl, 
        appId: _appid,
        debug: true
      }, function(hull, me, app, org){
        _hull.ready(hull, me, app, org);
      });
    },
    ready: function(){
      var args = arguments;
      this.saveArgs(arguments);
      this.$initSection.addClass('none');
      this.settings.init();
      _notify.show('success', 'Hull initialized successfully');
    },
    saveArgs: function(args){
      var argSize = args.length;
      for(var i=0; i<argSize; i++){
        this.args.push(args[i]);
      }
    },

    settings: {
      $section: $('.js-settings-section'),
      $form: $('.js-settings-form'),
      $container: $('.js-settings-container'),
      $createBtn: $('.js-settings-create'),
      $removeBtn: $('.js-setting-delete'),
      $receivers: $('.js-setting-receiver'),
      json: {},

      create: function(labelStr, inputStr){
        var $fieldset = $('<fieldset></fieldset>');
        var $label = $('<label />');
        var $input = $('<input type="text" />');
        var $removeBtn = $('<button type="button" class="js-setting-delete">Remove</button>');

        labelStr = labelStr.split(' ').join('-');

        // create html elements
        $label.attr('for', 'hull-settings-'+ labelStr)
          .html(labelStr);
        $input.attr({
          'id': 'hull-settings-'+ labelStr,
          'name': 'hull-settings-'+ labelStr,
          'value': inputStr
        });
        $fieldset.append($label, $input, $removeBtn)
          .appendTo(this.$container);

        // store in json
        this.json[labelStr] = inputStr;
      },
      init: function(){
        var _this = this;
        this.fetch(function(){
          _this.$section.removeClass('none');
          _this.set();
        });
        this.$createBtn.on('click', function(){
          var labelStr = prompt('KEY');
          var inputStr = prompt('VALUE');
          _this.create(labelStr, inputStr);
        });
        this.$form.on('submit', function(e){
          e.preventDefault();
          _this.save(function(data){
            _notify.show('success', 'Settings saved!');
          });
        });
        this.$removeBtn.live('click', function(){
          var $fieldset = $(this).closest('fieldset');
          _this.remove($fieldset);
        });
      },
      fetch: function(cb){
        var settings = _hull.args[2].extra;
        for(var key in settings){
          var val = settings[key];
          if(val !== false)
            this.create(key, val);
        }
        if(cb) cb();
      },
      set: function(){
        this.$receivers.each(function(i, el){
          var $el = $(el);
          var settings = _hull.args[2].extra;
          var settingKey = $el.attr('data-setting-key');
          $el.html(settings[settingKey]);
        });
      },
      save: function(json, cb){
        var _this = this;
        var jsonToSave;

        if(typeof json === 'object'){
          jsonToSave = json;
        }
        else {
          cb = json;
          jsonToSave = this.generateJSON();
        }
        
        Hull.api('app', 'put', {
          extra: jsonToSave
        }).then(function(data){
          if(cb) cb(data);
        });
      },
      remove: function($fieldset){
        var key = $fieldset.find('label').attr('for').split('hull-settings-')[1];
        this.json[key] = false;
        $fieldset.remove();
      },
      generateJSON: function(){
        var _this = this;
        var vals = this.$form.serializeArray();

        vals.forEach(function(el, i){
          var key = el.name.split('hull-settings-')[1];
          var val = el.value;
          _this.json[key] = val;
        });
        return _this.json;
      }
    },

    samplers: {
      $section: $('.js-samplers-section'),
      $select: $('.js-samplers-select'),

      init: function(){
        var _this = this;
        this.$section.removeClass('none');
        this.fetchSamplers(function(country){
          _this.addOption(country);
        });
        this.$select.on('change', function(){
          var selectValue = this.value;
          _this.takeSampler(selectValue);
        });
      },
      fetchSamplers: function(cb){
        var obj = _hull.settings.json;

        for(var country in obj){
          // check sampler- if has prefix
          var val = obj[country];
          var isValNumber = !isNaN(val);
          var isSampler = country.split('sampler-').length > 1;

          // if so, return country's name
          if(isSampler && isValNumber){
            currentCountry = country.split('sampler-')[1];
            cb(currentCountry);
          }
        }
      },
      addOption: function(country){
        var $option = $('<option value="'+ country +'">'+ country +'</option>');
        this.$select.append($option);
      },
      takeSampler: function(country){
        var json = _hull.settings.json;
        json['sampler-'+country]--;
        _hull.settings.save(json, function(data){
          _notify.show('success', 'Sampler taken');
        });
      }
    }
  };

  var _notify = {
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

  window._hull = _hull;
  window._notify = _notify;
  
  _notify.init();

  var session_orgurl = sessionStorage.get('_hull_orgurl');
  var session_appid = sessionStorage.get('_hull_appid');
  var hasAppDefined = session_orgurl !== null && session_appid !== null;
  
  if(hasAppDefined) _hull.init(session_orgurl, session_appid);
  else _hull.prepare();

});
  