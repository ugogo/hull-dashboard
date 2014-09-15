
var opts = {
  orgurl: "https://835b18df.hullapp.io",
  appid: "540ef0175f6f92e55b001366",
};

Stull.init(opts, function(){
  // on init

  // display a notification
  Notify.show('success', 'Hull initialized successfully');

  // for each settings container
  $('.js-settings-container').each(function(i, el){
    var $this = $(el);

    // create a variable with options
    // related to the container
    var opts = {
      pattern: $this.attr('data-pattern'),
      $model: $('<fieldset> <label></label> <input /> </fieldset>'),
      $container: $this
    };

    // fetch and display settings
    // related to the container
    Settings.fetch(opts, function(json){
      Settings.display();
    });
  });

});
