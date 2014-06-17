define([
  'jquery',
  'underscore',
  'backbone',
  'localstorage',
  'models/playerList',
  'models/roundList',
  'models/settings',
  'views/settingsView',
  'views/navigationView',
  'views/roundView',
  'views/lastUpdatedView',
], function($, _, Backbone, localstorage, PlayerList, RoundList, Settings, SettingsView, NavigationView, RoundView, LastUpdatedView) {
	
	var SETTINGS_ID ="settings";
  	
	var Router = Backbone.Router.extend({
	    routes: {
	      "": "settings",
	      "round/:number": "round",
	    }
	});

	var initialize = function() {
		var router = new Router();
		router.on('route:settings', function() {
			var playerList = new PlayerList();
			var roundList = new RoundList();
			var settings = new Settings();
			var settingsView = new SettingsView({playerList: playerList, roundList: roundList, settings: settings, router: this});
			$('#page').html(settingsView.render().el);
			var navigationView = new NavigationView({active: "settings", roundList: roundList});
			navigationView.render();
			$('#navigation').html(navigationView.el);
			new LastUpdatedView().render();
		});
		router.on('route:round', function(number) {
			var playerList = new PlayerList();
			var roundList = new RoundList();
			var settings = new Settings();
			new RoundView({number: number, playerList: playerList, roundList: roundList, settings: settings, router: this}).render();
			var navigationView = new NavigationView({active: number, roundList: roundList});
			$('#navigation').html(navigationView.render().el);
			new LastUpdatedView().render();
		});

	    Backbone.history.start();
	};
  
	return { initialize: initialize };
});