/*
 Copyright 2014 Bennie Lundmark

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
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
  'views/resultsView'
], function($, _, Backbone, localstorage, PlayerList, RoundList, Settings, SettingsView, NavigationView, RoundView, LastUpdatedView, ResultsView) {
  	
	var Router = Backbone.Router.extend({
	    routes: {
	      "": "settings",
        "#": "settings",
	      "round/:number": "round",
        "results": "results"
	    },

	    initialize: function() {
        var settings = new Settings();
        var playerList = new PlayerList({settings: settings});
	    	this.viewOptions = {
	    		playerList: playerList,
				  roundList: new RoundList({settings: settings, playerList: playerList}),
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
	    		_.each(options.playerList.where({id:'0'}), function(player) {
	    			player.set('noncompeting', 'true'); 
	    			player.set('bye', 'true');
	    		});
	    		options.settings.set('version', '1');
	    		options.settings.save();
	    	}
	    },
	});

	var initialize = function() {
		var router = new Router();
		router.on('route:settings', function() {
			$('#page').html(new SettingsView(router.viewOptions).render().el);
      router.viewOptions.active = "settings";
			var navigationView = new NavigationView(router.viewOptions);
			navigationView.render();
			$('#navigation').html(navigationView.el);
			new LastUpdatedView().render();
		});
		router.on('route:round', function(number) {
      if (router.roundView)
          router.roundView.remove();
      router.viewOptions.active = number;
      router.roundView = new RoundView(router.viewOptions).render();
      
      $('#page').html(router.roundView.el);
      
      var navigationView = new NavigationView(router.viewOptions);
			$('#navigation').html(navigationView.render().el);
			new LastUpdatedView().render();
		});
    router.on('route:results', function() {
      if (router.resultsView)
          router.resultsView.render();
      else {
          router.resultsView = new ResultsView(router.viewOptions).render();
      }
      $('#page').html(router.resultsView.el);
      router.viewOptions.active = 'results';
      var navigationView = new NavigationView(router.viewOptions);
      $('#navigation').html(navigationView.render().el);
      new LastUpdatedView().render();
    });

    Backbone.history.start();
	};
  
	return { initialize: initialize };
});