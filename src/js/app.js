
var fetchSettings = (function(){

  // for each settings container
  $('.js-settings-container').each(function(i, el){
    var $this = $(el);

    // create a variable with options
    // related to the current container
    var opts = {
      display: true,
      pattern: $this.attr('data-pattern'),
      $model: $('<fieldset> <label></label> <input /> </fieldset>'),
      $container: $this
    };

    // fetch and display settings
    // related to the current container
    Settings.fetch(opts);
  });

  // display settings section
  $('.js-settings-section').removeClass('none');
});
var mainOpts = {
  orgurl: "https://835b18df.hullapp.io",
  appid: "540ef0175f6f92e55b001366",
};

Stull.init(mainOpts, function(){
  // on init
  // display a notification
  Notify.show('success', 'Hull initialized successfully');

  // then, fetch settings
  fetchSettings();
});
