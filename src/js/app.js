var $body = $('body');
var SettingsFetch = (function(){
  // for each settings container
  $('.js-settings-container').each(function(i, el){
    var $this = $(el);

    // create a variable with options
    // related to the current container
    var opts = {
      display: true,
      pattern: $this.attr('data-pattern'),
      $model: $('<fieldset> <label></label> <input /> <button type="button" class="js-setting-drop">Remove</button> </fieldset>'),
      $container: $this
    };

    // fetch and display settings
    // related to the current container
    Settings.fetch(opts);
  });

  // display settings section
  $('.js-settings-section').removeClass('none');
});
var SettingsInit = (function(){
  Settings.init();
  SettingsFetch();
});
var mainOpts = {
  orgurl: "https://835b18df.hullapp.io",
  appid: "540ef0175f6f92e55b001366",
};

Stull.init(mainOpts, function(){
  // on init
  // display a notification
  Notify.show('success', 'Hull initialized successfully');

  // init Settings
  SettingsInit();
});

// triggers
// settings
  $body.on('settings-save--success', function(evt){
    // evt._data.app = current app
    // evt._data.json = json saved
    Notify.show('success', 'Settings updated!');
  });
  $body.on('settings-save--fail', function(evt){
    // evt._data = error
    Notify.show('error', 'An error occurred: '+ evt._data.message);
  });
  $body.on('settings-create--fail', function(){
    Notify.show('error', 'An error occurred');
  });

// stull
  $body.on('stull-get--ok', function(evt){
    // evt._data = arguments
    console.info(evt._data);
  });

// user
  $body.on('user-login--ok', function(evt){
    // evt._data.user = current user
    // evt._data.provider = provider
    Notify.show('success', 'Login with '+ evt._data.provider +': success!');
  });
  $body.on('user-logout--success', function(){
    Notify.show('success', 'Logout!');
  });
  $body.on('user-login--fail', function(){
    Notify.show('error', 'No provider defined');
  });
  $body.on('user-linkidentity--success', function(evt){
    // evt._data.user = current user
    // evt._data.provider = provider
    Notify.show('success', evt._data.provider +' identity linked successfully!');
  });
  $body.on('user-linkidentity--fail', function(evt){
    // evt._data = error
    Notify.show('error', 'An error occurred: '+ evt._data.message + ', ' + evt._data.reason);
  });


