
var opts = {
  orgurl: "https://835b18df.hullapp.io",
  appid: "540ef0175f6f92e55b001366",
};

Stull.init(opts, function(){
  Notify.show('success', 'Hull initialized successfully');

  $('.js-settings-container').each(function(i, el){
    var $this = $(el);

    var opts = {
      pattern: $this.attr('data-pattern'),
      $model: $('<fieldset> <label></label> <input /> </fieldset>'),
      $container: $this
    };

    Settings.fetch(opts, function(json){
      Settings.display();
    });
  });
  
});
