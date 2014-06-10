define([
  'jquery',
  'underscore',
  'backbone',
  'router',
], function($, _, Backbone, Router) {

  	var initialize = function() {
		window.applicationCache.addEventListener('updateready', function(e) {
	    	if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
	      		// Browser downloaded a new app cache.
	      		if (confirm('A new version of this site is available. Load it?')) {
	        		window.location.reload();
	      		}
	    	} 
	  	}, false);

	  	Router.initialize();
  	};

	return { initialize: initialize };
});