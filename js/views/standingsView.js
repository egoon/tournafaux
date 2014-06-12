define([
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/standings.html',
], function($, _, Backbone, standingsTemplate) {
  	var StandingsView = Backbone.View.extend({

		el: '.standings',

		initialize: function(options) {
			this.playerList = options.playerList;
			this.listenTo(this.playerList, 'change', this.render);

		},

		events: {
			"click #helpBye": "showHelpBye",
		},

		render: function() {
			var players = this.playerList.models;
			players = _.sortBy(players, function(p) {return p.getTotalVp()});
			players = _.sortBy(players, function(p) {return p.getVpDiff()});
			players = _.sortBy(players, function(p) {return p.getTotalTp()});
			players = players.reverse();
			var template = _.template(standingsTemplate, {players: players});
		    this.$el.html(template);
		},

		showHelpBye: function(e) {
			showHelpBye();
		},
	});
  	return StandingsView;
});