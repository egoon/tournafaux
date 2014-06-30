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
  	
	var Router = Backbone.Router.extend({
	    routes: {
	      "": "settings",
	      "round/:number": "round",
	    },

	    initialize: function() {
        var settings = new Settings();
	    	this.viewOptions = {
	    		playerList: new PlayerList({settings: settings}),
				  roundList: new RoundList(),
				  settings: settings,
				router: this,
	    	};
	    	this.compensateForOldVersions(this.viewOptions);
	    },

	    compensateForOldVersions: function(options) {
	    	options.settings.fetch();
	    	var version = parseInt(options.settings.get('version'));
	    	if (!options.settings.get('version') || version < 1) { 
	    		console.log('compensating for data older than 18 Jun 2014');
	    		options.roundList.fetch();
	    		options.playerList.fetch();
	    		if (options.roundList.length > 0) {
	    			options.settings.set('tables', Math.floor(parseInt(options.playerList.length/2)));
	    		}
	    		_.each(options.playerList.where({id:'-'}), function(player) {
	    			player.set('noncompeting', 'true'); 
	    			player.set('bye', 'true');
	    		});
	    		options.settings.set('version', 1);
	    		options.settings.save();
	    	}
	    },
	});

	var initialize = function() {
		var router = new Router();
		router.on('route:settings', function() {
			$('#page').html(new SettingsView(router.viewOptions).render().el);
			var navigationView = new NavigationView({active: "settings", roundList: router.viewOptions.roundList});
			navigationView.render();
			$('#navigation').html(navigationView.el);
			new LastUpdatedView().render();
		});
		router.on('route:round', function(number) {
      if (router.roundView)
          router.roundView.setRoundNumber(number).render();
      else {
          router.roundView = new RoundView(router.viewOptions).setRoundNumber(number).render();
      }
			var navigationView = new NavigationView({active: number, roundList: router.viewOptions.roundList});
			$('#navigation').html(navigationView.render().el);
			new LastUpdatedView().render();
		});

	    Backbone.history.start();
	};
  
	return { initialize: initialize };
});