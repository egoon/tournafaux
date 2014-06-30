define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'views/standingsView',
  'text!../../templates/round.tpl'
], function($, _, Backbone, GenerateRound, StandingsView, roundTemplate) {

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

			this.listenTo(this.playerList, 'change', this.validate);
		},

    setRoundNumber: function(number) {
        this.round = _.find(this.roundList.models, function(round){ return round.get("number") == number.toString()});
        return this;
    },

		events: {
			"click #generate-next-round": "generateRound",
      "click #disqualify-button": "disqualifyPlayer"
		},

		render: function() {
			if (this.round) {
				var noTables = parseInt(this.settings.get('tables'));
				
				var tables = this.round.getTables(noTables, this.playerList);
				
				var number = this.round.get('number');

				_.each(tables, function(table) {
					table.player1name = table.player1.getName();
					table.player1vp = table.player1.getVpForRound(number) ? table.player1.getVpForRound(number) : "";
					table.player1id = table.player1.id;
					table.player2name = table.player2.getName();
					table.player2vp = table.player2.getVpForRound(number) ? table.player2.getVpForRound(number) : "";
					table.player2id = table.player2.id;
				});

				var template = _.template(roundTemplate, {number: number, tables: tables, settings: this.settings, players: this.playerList.getCompetingPlayers()});
		      	this.$el.html(template);
		      	this.registerListeners();
		      	new StandingsView({playerList: this.playerList}).render();
			} else {
				var template = _.template("<h4>Round <%-number %> does not exist</h4>Sorry!", {number: number});
		      	this.$el.html(template);
			}
			return this;
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

		calculateTpAndVpDiff: function(round, player) { //TODO: refactor to tableView
            var tables = round.getTables(this.settings.getTables(), this.playerList);
            var number = round.get('number');
            for (var i = 0; i < tables.length; ++i) {
                var table = tables[i];
				var player1 = table.player1;
				var player2 = table.player2;
				if (player1.id === player.id || player2.id === player.id) {
					var player1vp = parseInt(player1.getVpForRound(number));
					var player2vp = parseInt(player2.getVpForRound(number));
					if (player1vp >= 0 && player2vp >= 0) {
						var diff = player1vp - player2vp;
						player1.setVpDiffForRound(number, diff);
						player2.setVpDiffForRound(number, -diff);
						player1.setTpForRound(number, diff > 0 ? 3 : diff < 0 ? 0: 1);
						player2.setTpForRound(number, diff < 0 ? 3 : diff > 0 ? 0: 1);
						player1.save();
						player2.save();
					} else {
						player1.setVpDiffForRound(number, 0);
						player2.setVpDiffForRound(number, 0);
						player1.setTpForRound(number, 0);
						player2.setTpForRound(number, 0);
						player1.save();
						player2.save();
					}
				}
			}
		},

		validate: function(e) {
			var that = this;
			this.errors = [];

			var tables = this.round.getTables(this.settings.get('tables'), this.playerList);

			for(var i = 0; i < tables.length; ++i) {
				var vp = tables[i].player1.getVpForRound(this.round.get('number'))
				if (!vp || vp == '') {
					this.errors.push(tables[i].player1.getName() + ' has no registered victory points');	
				}
				vp = tables[i].player2.getVpForRound(this.round.get('number'))
				if (!vp || vp == '') {
					this.errors.push(tables[i].player2.getName() + ' has no registered victory points');	
				}
			}

			this.$('#validation-errors').html('');
			for(var i = 0; i < this.errors.length; ++i) {
				this.$('#validation-errors').append('<li>'+this.errors[i]+'</li>');
			}
		},

		generateRound: function() {
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

    disqualifyPlayer: function() {
      var player = this.playerList.get(this.$('#disqualify-select').val());
      if (player.isRinger()) {
        alert("Removing ringer not supported. Yet.");
      } else {
        if (confirm("Are you sure you want to remove " + player.getName() + " from the tournament?")) {
          player.setActive(false);
          player.save();
        }
      }

    }

	});
  	return RoundView;
});