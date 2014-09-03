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
    prepare: function(){
      var $form = $('.js-hull-init');
      var $orgurl = $form.find('.js-hull-init-orgurl');
      var $appid = $form.find('.js-hull-init-appid');

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
      }, function(){
        _hull.ready();
      });
    },
    ready: function(){
      console.log('hull ready');
      $('.hull-init-section').hide();
    }
  };

  var session_orgurl = sessionStorage.get('_hull_orgurl');
  var session_appid = sessionStorage.get('_hull_appid');
  var hasAppDefined = session_orgurl !== null && session_appid !== null;
  
  if(hasAppDefined) _hull.init(session_orgurl, session_appid);
  else _hull.prepare();

});
  
