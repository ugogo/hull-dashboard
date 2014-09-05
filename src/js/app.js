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

  _hull = {
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
      this.$initSection.find('h2').html('Init Hull: OK');
      this.$initSection.find('.js-init-form').addClass('none');
      this.settings.init();
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
      $saveBtn: $('.js-settings-save'),
      json: {},

      create: function(labelStr, inputStr){
        var $fieldset = $('<fieldset></fieldset>');
        var $label = $('<label />');
        var $input = $('<input type="text" />');

        labelStr = labelStr.split(' ').join('-');

        // create html elements
        $label.attr('for', 'hull-settings-'+ labelStr)
          .html(labelStr);
        $input.attr({
          'id': 'hull-settings-'+ labelStr,
          'value': inputStr
        });
        $fieldset.append($label, $input)
          .appendTo(this.$container);

        // store in json
        this.json[labelStr] = inputStr;
      },
      init: function(){
        var _this = this;
        this.fetch(function(){
          _this.$section.removeClass('none');
        });
        this.$createBtn.on('click', function(){
          var labelStr = prompt('KEY');
          var inputStr = prompt('VALUE');
          _this.create(labelStr, inputStr);
        });
        this.$saveBtn.on('click', function(){
          _this.save(function(){
            alert('Settings saved');
          });
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
      save: function(cb){
        var _this = this;
        Hull.api('app', 'put', {
          extra: _this.json
        }).then(function(data){
          if(cb) cb(data);
        });
      }
    }
  };

  var session_orgurl = sessionStorage.get('_hull_orgurl');
  var session_appid = sessionStorage.get('_hull_appid');
  var hasAppDefined = session_orgurl !== null && session_appid !== null;
  
  if(hasAppDefined) _hull.init(session_orgurl, session_appid);
  else _hull.prepare();

});
  
