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
		var router = new Router;
		router.on('route:settings', function() {
			var playerList = new PlayerList();
			var roundList = new RoundList();
			var settings = new Settings({id: SETTINGS_ID, rounds: "3"});
			new SettingsView({playerList: playerList, roundList: roundList, settings: settings, router: this}).render();
			new NavigationView({active: "settings", roundList: roundList}).render();
			new LastUpdatedView().render();
		});
		router.on('route:round', function(number) {
			var playerList = new PlayerList();
			var roundList = new RoundList();
			var settings = new Settings({id: SETTINGS_ID, rounds: "3"});
			new RoundView({number: number, playerList: playerList, roundList: roundList, settings: settings, router: this}).render();
			new NavigationView({active: number, roundList: roundList}).render();
			new LastUpdatedView().render();
		});

	    Backbone.history.start();
	};
  
	return { initialize: initialize };
});