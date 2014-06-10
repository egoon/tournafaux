require.config({
  paths: {
    jquery: 'libs/jquery-1.11.1',
    underscore: 'libs/underscore-1.6.0',
    backbone: 'libs/backbone-1.1.2',
    localstorage: 'libs/backbone.localStorage-1.1.7',
  }

});

require([
  'app',
], function(App){
  App.initialize();
});