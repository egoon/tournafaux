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
			this.playerList = options.playerList;
			this.roundList = options.roundList;
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

		removePlayer: function(e) {
			this.roundList.fetch();
			this.playerList.fetch();
			if (this.roundList.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					this.player.destroy();
					while(this.roundList.at(0)) {
						this.roundList.at(0).destroy();
					}
					this.playerList.each(function(player) {
						player.clearGames();
						player.save();
					});
					this.remove();
				}
			} else {
				this.player.destroy();
				this.remove();
			}

			return false;
		},
	});
  
  	return PlayerView;
});