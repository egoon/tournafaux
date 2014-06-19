define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'views/standingsView',
  'text!../../templates/round.html',
], function($, _, Backbone, GenerateRound, StandingsView, roundTemplate) {
  	
  	var showHelpBye = function () {
		$("#help").html("<h4>Bye</h4>If the tournament has an uneven amount of players, " +
		 "a Bye is created. The player that was matched against the bye will score an average of " + 
		 "all games. This will be recalculated after every round. If the player has played no games, she " +
		 "will have 1 TP and 1 VP temporarily. The bye will always be matched against the player with the " +
		 "lowest score that has not yet been matched with the bye.<hr/>");
  	};

  	var RoundView = Backbone.View.extend({

		el: '#page',

		initialize: function(options) {
			this.playerList = options.playerList;
			this.playerList.fetch();
			this.roundList = options.roundList;
			this.roundList.fetch();

			this.settings = options.settings;
			this.settings.fetch();

			this.router = options.router;

			this.round = _.find(this.roundList.models, function(round){ return round.get("number") == "" + options.number});

			this.listenTo(this.playerList, 'change', this.validate);
		},

		events: {
			"click #generate-rounds": "generateRounds",
			"click #helpBye": "showHelpBye",
		},

		render: function() {
			if (this.round) {
				var noTables = parseInt(this.settings.get('tables'));
				
				var tables = this.round.getTables(noTables, this.playerList);
				
				var number = this.round.get('number');

				_.each(tables, function(table) {
					table.player1name = table.player1.get('name');
					table.player1vp = table.player1.getVpForRound(number) ? table.player1.getVpForRound(number) : "";
					table.player1id = table.player1.id;
					table.player2name = table.player2.get('name');
					table.player2vp = table.player2.getVpForRound(number) ? table.player2.getVpForRound(number) : "";
					table.player2id = table.player2.id;
				});

				var template = _.template(roundTemplate, {number: number, tables: tables, settings: this.settings});
		      	this.$el.html(template);
		      	this.registerListeners();
		      	new StandingsView({playerList: this.playerList}).render();
			} else {
				var template = _.template("<h4>Round <%-number %> does not exist</h4>Sorry!", {number: number});
		      	this.$el.html(template);
			}
			
		},

		registerListeners: function() {
			var that = this;
			var number = this.round.get('number');
			if (this.round) {
				_.each(this.playerList.models, function(player) {
					this.$("#" + player.id).change(function(event) {
						if (parseInt(event.currentTarget.value) >= 0) {
							player.setVpForRound(number, event.currentTarget.value);
						} else {
							event.currentTarget.value = '0';
							player.setVpForRound(number, '0');
						}
						player.save();
						that.calculateTpAndVpDiff(that.round, player);
					});
				});
			}
		},

		calculateTpAndVpDiff: function(round, player) {
			var i = 1;
			while(round.get('table'+i+'player1')) {
				var player1 = this.playerList.get(round.get('table'+i+'player1'));
				var player2 = this.playerList.get(round.get('table'+i+'player2'));
				if (player1.id === player.id || player2.id === player.id) {
					var player1vp = parseInt(player1.getVpForRound(round.get('number')));
					var player2vp = parseInt(player2.getVpForRound(round.get('number')));
					if (player1vp >= 0 && player2vp >= 0) {
						var diff = player1vp - player2vp;
						player1.setVpDiffForRound(round.get('number'), diff);
						player2.setVpDiffForRound(round.get('number'), -diff);
						player1.setTpForRound(round.get('number'), diff > 0 ? 3 : diff < 0 ? 0: 1);
						player2.setTpForRound(round.get('number'), diff < 0 ? 3 : diff > 0 ? 0: 1);
						player1.save();
						player2.save();
					} else {
						player1.setVpDiffForRound(round.get('number'), 0);
						player2.setVpDiffForRound(round.get('number'), 0);
						player1.setTpForRound(round.get('number'), 0);
						player2.setTpForRound(round.get('number'), 0);
						player1.save();
						player2.save();
					}
				}
				
				++i;
			}
		},

		validate: function(e) {
			var that = this;
			this.errors = [];

			var tables = this.round.getTables(this.settings.get('tables'), this.playerList);

			for(var i = 0; i < tables.length; ++i) {
				var vp = tables[i].player1.getVpForRound(this.round.get('number'))
				if (!vp || vp == '') {
					this.errors.push(tables[i].player1.get('name') + ' has no registered victory points');	
				}
				vp = tables[i].player2.getVpForRound(this.round.get('number'))
				if (!vp || vp == '') {
					this.errors.push(tables[i].player2.get('name') + ' has no registered victory points');	
				}
			}

			this.$('#validation-errors').html('');
			for(var i = 0; i < this.errors.length; ++i) {
				this.$('#validation-errors').append('<li>'+this.errors[i]+'</li>');
			}
		},

		generateRounds: function() {
			this.validate();
			if (this.errors.length > 0) {
				this.$('#validation-errors').show();
			} else {
				var number = parseInt(this.round.get('number')) + 1;
				GenerateRound.generate(number, this.playerList, this.roundList, this.settings);
				this.router.navigate("#/round/"+ number);
			}
			return false;
		},

		showHelpBye: function(e) {
			showHelpBye();
		},

	});
  	return RoundView;
});