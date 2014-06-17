define([
  'jquery',
  'underscore',
  'backbone',
  'localstorage',
], function($, _, Backbone, localstorage){
  var Settings = Backbone.Model.extend({

	  	initialize: function() {

	  		if (!this.id) {
        		this.set("id", "settings");
      		}
      		if (!this.get("rounds")) {
        		this.set("rounds", "3");
      		}
            if (!this.get("tables")) {
                this.set("tables", "");
            }
    	},

        localStorage: new Backbone.LocalStorage("tournafaux-settings"),

    });
  return Settings;
});