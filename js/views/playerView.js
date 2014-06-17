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
			"change input.name": "updateName",
			"change input.city": "updateCity",
			"change input.faction": "updateFaction",
		},

		render: function() {
			var template =_.template(playerTemplate, {player: this.player});
			this.$el.html(template);
			this.$el.attr('id', this.player.id);
		},

		updateName: function(e) {
			this.player.set('name', e.currentTarget.value);
			this.player.save();
			return false;
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
			var that = this;
			if (this.roundList.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					this.playerList.each(function(player) {
						player.clearGames(that.roundList.length);
						player.save();
					});
					this.player.destroy();
					while(this.roundList.at(0)) {
						this.roundList.at(0).destroy();
					};
					this.$el.hide(function() {that.remove()});
					
				}
			} else {
				this.player.destroy();
				this.$el.hide(function() {that.remove()});
			}

			return false;
		},
	});
  
  	return PlayerView;
});