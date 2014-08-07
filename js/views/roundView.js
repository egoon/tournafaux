/*
 Copyright 2014 Bennie Lundmark

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'logic/generateRound',
  'views/standingsView',
  'text!../../templates/round.tpl'
], function($, _, Backbone, GenerateRound, StandingsView, roundTemplate) {

  	var RoundView = Backbone.View.extend({

		tagName: 'div',

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
      "click #show-results": "showResultsPage",
      "click #disqualify-button": "disqualifyPlayer",
      "change td.vp input": "changeVP"
		},

		render: function() {
			if (this.round) {
				var noTables = this.settings.getTables();
				
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

        if (this.settings.getRounds() <= parseInt(number)) {
          this.$('#generate-next-round').hide();
          this.$('#show-results').show();
        } else {
          this.$('#generate-next-round').show();
          this.$('#show-results').hide();
        }

        this.$("#standings").html(new StandingsView({playerList: this.playerList}).render().el);
			} else {
				var template = _.template("<h4>Round <%-number %> does not exist</h4>Sorry!", {number: number});
        this.$el.html(template);
			}
			return this;
		},

    changeVP: function(event) {
      var number = this.round.get('number');
      var player = this.playerList.get(event.currentTarget.id);
      if (parseInt(event.currentTarget.value) >= 0) {
        player.setVpForRound(number, event.currentTarget.value);
      } else {
        event.currentTarget.value = '0';
        player.setVpForRound(number, '0');
      }
      player.save();
      this.calculateTpAndVpDiff(this.round, player);
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

    showResultsPage: function() {
      this.validate();
      if (this.errors.length > 0) {
        this.$('#validation-errors').show();
      } else {
        this.router.navigate("#/results");
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