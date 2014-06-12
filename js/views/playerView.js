define([
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/player.html',
], function($, _, Backbone, playerTemplate) {

	var PlayerView = Backbone.View.extend({
		tagName: "tr",

		initialize: function(options) {
			this.player = options.player;
		},

		events: {
			"click button.removePlayer": "removePlayer",
			"change input.city": "updateCity",
			"change input.faction": "updateFaction",
		},

		render: function() {
			var template =_.template(playerTemplate, {player: this.player});
			this.$el.html(template);
		},

		updateCity: function(e) {
			this.player.set('city', e.currentTarget.value);
			this.player.save();
			return false;
		},

		updateFaction: function(e) {
			this.player.set('faction', e.currentTarget.value);
			this.player.save();
			return false;
		},
	});
  
  	return PlayerView;
});