define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'text!../../templates/settings.html',
], function($, _, Backbone, GenerateRound, settingsTemplate) {

	var showHelpCityFaction = function() {
  		$("#help").html("<h4>City/Club and Faction</h4>If you fill these fields, players from the same city, "+
		"or playing the same faction, will not face each other in the first game. If possible.<hr/>");
  	};

  	var SettingsView = Backbone.View.extend({
		
		el: '#page',

		events: {
			"keypress #new-player": "createOnEnter",
			"click button.removePlayer": "removePlayer",
			"click #generate-round": "generateRound",
			"change #rounds": "changeRounds",
			"change input.city": "updateCity",
			"change input.faction": "updateFaction",
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
			
			this.listenTo(this.playerList, 'change', this.render);
			this.listenTo(this.playerList, 'remove', this.render);
			this.listenTo(this.playerList, 'reset', this.render);
			this.listenTo(this.settings, 'change', this.render);
		},
		
		render: function() {
			var template = _.template(settingsTemplate, {players: this.playerList, settings: this.settings});
	      	this.$el.html(template);
	      	this.newPlayer = this.$("#new-player");
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13 && e.keyCode != 9) return;
			if (!this.newPlayer.val()) return;

			var player = this.playerList.create({name: this.newPlayer.val(), city: '', faction: ''});

			this.newPlayer.val('');
			this.$("#"+player.id+".city").focus();
		},

		removePlayer: function(e) {
			this.roundList.fetch();
			if (this.roundList.models.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					this.playerList.get(e.currentTarget.id).destroy();
					this.roundList.each(function(round) { round.destroy(); });
					this.playerList.each(function(player) {
						player.clearGames();
					});
				}
			} else 
				this.playerList.get(e.currentTarget.id).destroy();

			return false;
		},

		updateCity: function(e) {
			var player = this.playerList.get(e.currentTarget.id);
			player.set('city', e.currentTarget.value);
			player.save();
			this.$("#"+player.id +".faction").focus();
			return false;
		},

		updateFaction: function(e) {
			var player = this.playerList.get(e.currentTarget.id);
			player.set('faction', e.currentTarget.value);
			player.save();
			this.$("#"+player.id +".removePlayer").focus();
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