
var opts = {
  orgurl: "https://835b18df.hullapp.io",
  appid: "540ef0175f6f92e55b001366",
};

Stull.init(opts, function(){
  Notify.show('success', 'Hull initialized successfully');

  var opts = {
    pattern: 'sampler-test-'
  };
  Settings.fetch(opts, function(json){
    var $fieldset = $('<fieldset />');
    var $label = $('<label />');
    var $input = $('<input />');

    $fieldset.append($label, $input);

    var opts = {
      $container: $('.js-settings-container'),
      $model: $fieldset
    };

    Settings.display(opts);
  });
});
