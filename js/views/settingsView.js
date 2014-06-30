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

    var showHelpBye = function() {
        $("#help").html("<h4>Bye</h4>If you have an uneven amount of players, a Bye will be automatically generated. " +
        "In the first round a random player will be matched against the bye. In the next rounds the player with the " +
        "lowest score, that has not already received a bye, will get the bye.<h5>Average Bye</h5>" +
        "Scoring against this bye will be an average of the other games by the player that was matched against the bye. " +
        "The first round (when there is no average), the player will get a temporary 0-0 draw.<h5>Gaining Grounds 2014 Bye</h5>" +
        "A player that receives the bye will score 3 TP, 10 VP and +5 VP diff.<hr/>");
    };

    var showHelpRinger = function() {
        $("#help").html("<h4>Ringer</h4>A Ringer is a good friend or other person who agrees to step in and play, should the number " +
        "of players be uneven. And concede should the number of players even out again, due to disqualifications or " +
        "forfeits.<h5>Non-Competing Ringer</h5>If a tournaments organiser steps in as Ringer, she will not be part of " +
        "the final results, and will be matched like a bye.<h5>Competing Ringer</h5>A regular Ringer will, assuming " +
        "she takes part of the entire tournament, be treated and matched like a regular player.<hr/>");
    };

  	var SettingsView = Backbone.View.extend({
		
		tagName: 'div',

		events: {
			"keypress #new-player": "createOnEnter",
			"click #generate-first-round": "generateRound",
			"change #rounds": "changeRounds",
			"change #tables": "changeTables",
			"click input[name=byes]": "changeBye",
      "click input[name=tournamentType]": "changeTournamentType",
			"click #helpCityFaction": "showHelpCityFaction",
      "click #helpBye": "showHelpBye",
      "click #helpRinger": "showHelpRinger"
		},
		
		initialize: function(options) {
			this.playerList = options.playerList;
			this.playerList.fetch();
			this.roundList = options.roundList;
			this.roundList.fetch();

			this.settings = options.settings;
			this.settings.fetch();

			this.router = options.router;
			
			this.listenTo(this.playerList, 'add', this.validate);
			this.listenTo(this.playerList, 'remove', this.validate);
			this.listenTo(this.playerList, 'reset', this.validate);
			this.listenTo(this.settings, 'change:rounds', this.validate);
			this.listenTo(this.settings, 'change:tables', this.validate);

      this.byeRinger = this.playerList.getByeRinger();
		},
		
		render: function() {
			var template = _.template(settingsTemplate, {settings: this.settings});
        this.$el.html(template);
        this.newPlayerInput = this.$("#new-player");

        this.$('input[name="byes"]').filter('[value="' + this.settings.getBye() +'"]').prop('checked', true);
        this.$('input[name="tournamentType"]').filter('[value="' + this.settings.getTournamentType() +'"]').prop('checked', true);

        var i = 0;
        while(this.playerList.at(i)) {
          this.addPlayerView(this.playerList.at(i));
          ++i;
        };
        this.validate();
        return this;
		},

		addPlayerView: function(player) {
			var playerView = new PlayerView({
				player: player, 
				playerList: this.playerList, 
				roundList: this.roundList
			});
			playerView.render();
			this.$("#new-player-row").before(playerView.el);
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13 && e.keyCode != 9) return;
			if (!this.newPlayerInput.val()) return;

			var player = this.playerList.create({name: this.newPlayerInput.val(), city: '', faction: ''});

			this.newPlayerInput.val('');
			this.addPlayerView(player);
		},

		changeRounds: function() {
			if (isNaN(this.$("#rounds").val()))
				this.$("#rounds").val('');
			this.settings.setRounds( this.$("#rounds").val());
		},

		changeTables: function() {
			if (isNaN(this.$("#tables").val()))
				this.$("#tables").val('');
			this.settings.setTables(this.$("#tables").val());
		},

		changeBye: function() {
			this.settings.setBye(this.$('input[name="byes"]:checked').val());
      if (this.settings.getBye() == this.settings.AVERAGE_BYE || this.settings.getBye() == this.settings.GG14_BYE) {
        this.byeRinger.setBye(true);
        this.byeRinger.setNonCompeting(true);
      } else {
        this.byeRinger.setRinger(true);
        if (this.settings.getBye() == this.settings.COMPETING_RINGER)
          this.byeRinger.setNonCompeting(false);
        else
          this.byeRinger.setNonCompeting(true);
      }
      this.byeRinger.save();
		},

    changeTournamentType: function() {
        this.settings.setTournamentType(this.$('input[name="tournamentType"]:checked').val());
    },

		generateRound: function() {
			this.validate();
			if (this.errors.length > 0) {
				this.$('#validation-errors').show();
			} else {
				if (isNaN(this.settings.getTables())) {
					this.settings.setTables(Math.floor(parseInt(this.playerList.length/2)));
					this.settings.save();
				}
				GenerateRound.generate(1, this.playerList, this.roundList, this.settings);
				this.router.navigate("#/round/1");
				this.remove();
			}
			return false;
		},

		validate: function(e) {
			this.errors = [];
			// rounds
			if (isNaN(this.settings.getRounds())) {
				this.errors.push('You must select a number of rounds');
			} else if (this.settings.getRounds() >= this.playerList.length) {
				this.errors.push('You must have more players than rounds');
			} 
			// tables
			if (!isNaN(this.settings.getTables()) && this.settings.getTables() < Math.floor(this.playerList.length / 2)) {
				this.errors.push('You need at least ' + Math.floor(this.playerList.length / 2) + ' tables for ' + this.playerList.length + ' players');
			}

			this.$('#validation-errors').html('');
			for(var i = 0; i < this.errors.length; ++i) {
				this.$('#validation-errors').append('<li>'+this.errors[i]+'</li>');
			}
		},

		showHelpCityFaction: function(e) {
			showHelpCityFaction();
		},
    showHelpBye: function(e) {
      showHelpBye();
    },
    showHelpRinger: function(e) {
      showHelpRinger();
    }
	});
  	return SettingsView;
});