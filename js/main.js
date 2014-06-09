require.config({
  paths: {
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.2/underscore',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone',
    localstorage: '//cdnjs.cloudflare.com/ajax/libs/backbone-localstorage.js/1.1.7/backbone.localStorage',
  }

});

require([

  // Load our app module and pass it to our definition function
  'tournafaux',
], function(App){
	console.log(App);
  // The "app" dependency is passed in as "App"
  App.initialize();
});