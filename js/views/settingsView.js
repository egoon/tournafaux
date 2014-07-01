define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'logic/helpTexts',
  'views/playerView',

  'text!../../templates/settings.tpl',
], function($, _, Backbone, GenerateRound, HelpTexts, PlayerView, settingsTemplate) {

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
      "click #helpRinger": "showHelpRinger",
      "click #helpTournamentType": "showHelpTournamentType"
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

		showHelpCityFaction: function() {
			HelpTexts.showHelpText("cityFaction");
		},
    showHelpBye: function() {
      HelpTexts.showHelpText("bye,average-bye,gg14-bye");
    },
    showHelpRinger: function() {
      HelpTexts.showHelpText("ringer,competing-ringer,non-competing-ringer");
    },
    showHelpTournamentType: function() {
      HelpTexts.showHelpText("tournamentType,swiss,gg14-swiss");
    }
	});
  	return SettingsView;
});