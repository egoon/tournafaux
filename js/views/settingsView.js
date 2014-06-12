define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'views/playerView',
  'text!../../templates/settings.html',
], function($, _, Backbone, GenerateRound, PlayerView, settingsTemplate) {

	var showHelpCityFaction = function() {
  		$("#help").html("<h4>City/Club and Faction</h4>If you fill these fields, players from the same city, "+
		"or playing the same faction, will not face each other in the first game. If possible.<hr/>");
  	};

  	var SettingsView = Backbone.View.extend({
		
		el: '#page',

		events: {
			"keypress #new-player": "createOnEnter",
			"click #generate-round": "generateRound",
			"change #rounds": "changeRounds",
			"click #helpCityFaction": "showHelpCityFaction",
		},
		
		initialize: function(options) {
			this.playerList = options.playerList;
			this.playerList.fetch();
			this.roundList = options.roundList;
			this.roundList.fetch();

			this.settings = options.settings;
			this.settings.fetch();

			this.router = options.router;
			
			// this.listenTo(this.playerList, 'change', this.render);
			// this.listenTo(this.playerList, 'remove', this.render);
			// this.listenTo(this.playerList, 'reset', this.render);
			// this.listenTo(this.settings, 'change', this.render);
		},
		
		render: function() {
			var template = _.template(settingsTemplate, {noPlayers: this.playerList.length, settings: this.settings});
	      	this.$el.html(template);
	      	this.newPlayer = this.$("#new-player");
	      	this.playerList.each(this.addPlayerView);
		},

		addPlayerView: function(player) {
			var playerView = new PlayerView({player: player});
			playerView.render();
			this.$("#new-player-row").before(playerView.el);
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13 && e.keyCode != 9) return;
			if (!this.newPlayer.val()) return;

			var player = this.playerList.create({name: this.newPlayer.val(), city: '', faction: ''});

			this.newPlayer.val('');
			this.addPlayerView(player);

		},

		removePlayer: function(e) {
			this.roundList.fetch();
			if (this.roundList.models.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					this.playerList.get(e.currentTarget.id).destroy();
					while(this.roundList.at(0)) {
						this.roundList.at(0).destroy();
					}
					this.playerList.each(function(player) {
						player.clearGames();
						player.save();
					});
				}
			} else 
				this.playerList.get(e.currentTarget.id).destroy();

			return false;
		},

		changeRounds: function() {
			this.settings.set('rounds', this.$("#rounds").val());
			this.settings.save();
		},

		generateRound: function() {
			//TODO validation
			GenerateRound.generate(1, this.playerList, this.roundList);
			this.router.navigate("#/round/1");
			return false;
		},

		showHelpCityFaction: function(e) {
			showHelpCityFaction();
		},
	});
  	return SettingsView;
});