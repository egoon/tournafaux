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
		
		tagName: 'div',

		events: {
			"keypress #new-player": "createOnEnter",
			"click #generate-round": "generateRound",
			"change #rounds": "changeRounds",
			"change #tables": "changeTables",
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
			
			this.listenTo(this.playerList, 'add', this.validate);
			this.listenTo(this.playerList, 'remove', this.validate);
			this.listenTo(this.playerList, 'reset', this.validate);
			this.listenTo(this.settings, 'change:rounds', this.validate);
			this.listenTo(this.settings, 'change:tables', this.validate);
		},
		
		render: function() {
			var template = _.template(settingsTemplate, {settings: this.settings});
	      	this.$el.html(template);
	      	this.newPlayerInput = this.$("#new-player");

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
			
			this.settings.set('rounds', this.$("#rounds").val());
			this.settings.save();
			
		},

		changeTables: function() {
			if (isNaN(this.$("#tables").val()))
				this.$("#tables").val('');
		
			this.settings.set('tables', this.$("#tables").val());
			this.settings.save();
		},

		generateRound: function() {
			this.validate();
			if (this.errors.length > 0) {
				this.$('#validation-errors').show();
			} else {
				if (this.settings.get('tables') == '') {
					this.settings.set('tables', Math.floor(parseInt(this.playerList.length/2)));
					this.settings.save();
				}
				GenerateRound.generate(1, this.playerList, this.roundList, this.settings);
				this.router.navigate("#/round/1");
				this.remove();
			}
			return false;
		},

		validate: function(e) {
			var that = this;
			this.errors = [];
			// rounds
			if (this.settings.get('rounds') == '') {
				this.errors.push('You must select a number of rounds');
			} else if (parseInt(this.settings.get('rounds')) >= this.playerList.length) {
				this.errors.push('You must have more players than rounds');
			} 
			// tables
			if (this.settings.get('tables') != '' && parseInt(this.settings.get('tables')) < Math.floor(this.playerList.length / 2)) {
				this.errors.push('You need at least ' + Math.floor(this.playerList.length / 2) + ' tables for ' + this.playerList.length + ' players');
			}

			if (this.errors.length > 0) {
				this.$('#validation-errors').html('');
				for(var i = 0; i < this.errors.length; ++i) {
					this.$('#validation-errors').append('<li>'+this.errors[i]+'</li>');
				}
				this.$('#generate-round').attr('class', 'btn btn-danger');
			} else {
				this.$('#generate-round').attr('class', 'btn btn-primary');
				// hide and clear errors
				this.$('#validation-errors').hide(function() {that.$('#validation-errors').html('')});
			}
		},

		showHelpCityFaction: function(e) {
			showHelpCityFaction();
		},
	});
  	return SettingsView;
});