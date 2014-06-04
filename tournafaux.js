$(function() {

	var BYE_ID = "0";
	var BYE_SCORE = "-";

	var Player = Backbone.Model.extend({

		initialize: function() {

      		if (!this.get("name")) {
        		this.set({"name": "No name?"});
      		}
    	},

    	getPreviousOpponents: function() {
    		var i = 1;
    		var opponents = [];
    		while (this.get("opponent"+i)) {
    			opponents.push(this.get("opponent"+i))
    			i++;
    		}
    		return opponents;
    	},

    	countPointsWithBye: function(pointType, byeScore) {
    		var i = 1;
			var total = 0;
    		var bye = false;
    		var realGames = 0;
    		while(this.get(pointType+i)) {
    			if (this.get(pointType+i) === BYE_SCORE) {
    				bye = true;
    			} else {
    				total += parseInt(this.get(pointType+i));
    				realGames += 1;
    			}
    			i++;
    		}
    		if (bye) {
    			if (realGames == 0)
    				total = byeScore;
    			else
    				total += (total / realGames);
    		}
    		return total;
    	},

    	getTotalTp: function() {
    		return this.countPointsWithBye('tp', 1);
    	},

    	getTotalVp: function() {
    		return this.countPointsWithBye('vp', 1);
    	},

    	getVpDiff: function() {
    		return this.countPointsWithBye('vpdiff', 0);
    	},

    	getBestMatches: function(players) {
    		var that = this;

    		var prevOpps = this.getPreviousOpponents();

    		var possibleOpps = _.filter(players, function(player) {
    			if (that.id == player.id) return false;
    			return _.indexOf(prevOpps, player.id) == -1;
    		});
    		
    		var bestMatches = _.sortBy(possibleOpps, function(opp) {
    			var scoreForSorting =
    			(Math.abs(that.getTotalTp() - opp.getTotalTp()) * 10000) +
    			(Math.abs(that.getVpDiff() - opp.getVpDiff()) * 100) +
    			(Math.abs(that.getTotalVp() - opp.getTotalVp()));
    			return -scoreForSorting;
    		});
    		
    		return bestMatches;
    	},

    	getVpForRound: function(round) { return this.get('vp'+round);},
    	setVpForRound: function(round, vp) { return this.set('vp'+round, ""+vp);},
    	getVpDiffForRound: function(round) { return this.get('vpdiff'+round);},
    	setVpDiffForRound: function(round, vpdiff) { return this.set('vpdiff'+round, ""+vpdiff);},
    	getTpForRound: function(round) { return this.get('tp'+round);},
    	setTpForRound: function(round, tp) { return this.set('tp'+round, ""+tp);},
    	getOpponentForRound: function(round) { return this.get('opponent'+round);},
    	setOpponentForRound: function(round, opponent) { return this.set('opponent'+round, ""+opponent);},

    	clearGames: function() {
			var i = 1;
			while(this.getOpponentForRound(i)) {
				this.unset('vp'+i);
				this.unset('vpdiff'+i);
				this.unset('tp'+i);
				this.unset('opponent'+i);
				++i;
			}
    	},

	});

	var PlayerList = Backbone.Collection.extend({

		model: Player,
	
		localStorage: new Backbone.LocalStorage("tournafaux-players"),

	});

	var Players = new PlayerList;


	var Round = Backbone.Model.extend({
		
		initialize: function() {
      		if (!this.get("number")) {
        		this.set({"number": "666"});
      		}
    	},

	});

	var RoundList = Backbone.Collection.extend({

		model: Round,

		localStorage: new Backbone.LocalStorage("tournafaux-rounds"),

		newRound: function(number, maxNumber) {



			var round = _.find(this.models, function(round){ return round.get("number") == ""+number});
			
			if (!round) {
				round = this.create({number: ""+number, maxNumber: maxNumber});
			} else {
				_.each(Players.models, function(p) {p.unset("opponent"+number)});
			}

			// Create bye if needed
			if (Players.models.length % 2 == 1)
				Players.create({id:BYE_ID, name:"-"});

			var players = Players.models;
			var matches = [];

			_.each(players, function(player) {
				matches.push({player: player, matches: player.getBestMatches(Players.models)});
			});

			var table = 1;
			while (matches.length > 0) {

				matches = _.shuffle(matches);
				matches = _.sortBy(matches, function(match) {return match.player.getTotalVp()});
				matches = _.sortBy(matches, function(match) {return match.player.getVpDiff()});
				matches = _.sortBy(matches, function(match) {return match.player.getTotalTp()});
				matches = _.sortBy(matches, function(match) {return -match.matches.length});

				var match = matches.pop();
				var player1 = match.player;
				var player2 = match.matches.pop();

				matches = _.reject(matches, function(m) {return m.player.id == player2.id});
				_.each(matches, function(match) {
					match.matches = _.reject(match.matches, function(m) { 
						return m.id == player1.id || m.id == player2.id; 
					});
				});

				player1.set("opponent" + number, player2.id);
				player2.set("opponent" + number, player1.id);
				if (player1.id == BYE_ID)
					this.setScoresForBye(player1, player2, number);
				if (player2.id == BYE_ID)
					this.setScoresForBye(player2, player1, number);
				player1.save();
				player2.save();
				round.set("table"+table+"player1", player1.id);
				round.set("table"+table+"player2", player2.id);

				round.save();
				table ++;
			}

		},

		setScoresForBye: function(bye, opp, number) {
			bye.setVpForRound(number, "0");
			bye.setVpDiffForRound(number, "0");
			bye.setTpForRound(number, "0");
			opp.setVpForRound(number, BYE_SCORE);
			opp.setVpDiffForRound(number, BYE_SCORE);
			opp.setTpForRound(number, BYE_SCORE);


		},
	});

	var Rounds = new RoundList();

	var TournamentSettingsView = Backbone.View.extend({
		
		el: '.page',

		events: {
			"keypress #new-player": "createOnEnter",
			"click button.removePlayer": "removePlayer",
			"click #generate-round": "generateRound"
		},
		
		initialize: function() {
			Players.fetch();
			Rounds.fetch();

			this.listenTo(Players, 'add', this.render);
			this.listenTo(Players, 'remove', this.render);
			this.listenTo(Players, 'reset', this.render);
			// this.listenTo(router, 'route:settings', this.render);
		

		},
		
		render: function(options) {
			var template = _.template($('#tournament-settings-template').html(), {players: Players});
	      	this.$el.html(template);
	      	this.newPlayer = this.$("#new-player");
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			if (!this.newPlayer.val()) return;

			Players.create({name: this.newPlayer.val()});
			
			this.newPlayer.val('');
			this.newPlayer.focus();
		},

		removePlayer: function(e) {
			if (Rounds.models.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					Players.get(e.currentTarget.id).destroy();
					Rounds.each(function(round) { round.destroy(); });
					Players.each(function(player) {
						player.clearGames();
					});
				}
			} else 
				Players.get(e.currentTarget.id).destroy();

			return false;
		},

		generateRound: function() {
			//TODO validation
			Rounds.newRound(1, this.$("#rounds").val());
			router.navigate("#/round/1");
			return false;
		}
	});

	var tournamentSettingsView = new TournamentSettingsView();

	var TournamentStandingsView = Backbone.View.extend({

		el: '.standings',

		initialize: function() {
			// this.listenTo(Players, 'change', this.render);

		},

		render: function() {
			Players.fetch();
			var players = Players.models;
			players = _.sortBy(players, function(p) {return p.getTotalVp()});
			players = _.sortBy(players, function(p) {return p.getVpDiff()});
			players = _.sortBy(players, function(p) {return p.getTotalTp()});
			players = players.reverse();
			var template = _.template($('#tournament-standings-template').html(), {players: players});
		    this.$el.html(template);
		},
	});

	var tournamentStandingsView = new TournamentStandingsView();

	var TournamentRoundView = Backbone.View.extend({

		el: '.page',

		initialize: function() {
		},

		events: {
			"click #generate-rounds": "generateRounds"
		},

		render: function(number) {
			Players.fetch();
			Rounds.fetch();

			this.round = _.find(Rounds.models, function(round){ return round.get("number") == "" + number});
			
			if (this.round) {
				var tables = [];
				var i = 1;

				while (this.round.get('table'+i+'player1')) {
					var player1 = Players.get(this.round.get('table'+i+'player1'));
					var player2 = Players.get(this.round.get('table'+i+'player2'));
					tables.push({number: ""+i,
						player1name: player1.get('name'),
						player1vp: player1.getVpForRound(number) ? player1.getVpForRound(number) : "",
						player1id: player1.id,
						player2name: player2.get('name'),
						player2vp: player2.getVpForRound(number) ? player2.getVpForRound(number) : "",
						player2id: player2.id});
					++i;
				};

				var template = _.template($('#tournament-round-template').html(), {number: this.round.get('number'), tables: tables});
		      	this.$el.html(template);
			} else {
				var template = _.template($('#tournament-no-round-template').html(), {number: number});
		      	this.$el.html(template);
			}
			
			tournamentStandingsView.remove();
			tournamentStandingsView = new TournamentStandingsView();
			tournamentStandingsView.render();
			
		},

		registerListeners: function(number) {
			this.round = _.find(Rounds.models, function(round){ return round.get("number") == "" + number});
			var that = this;

			if (this.round) {
				_.each(Players.models, function(player) {
					this.$("#" + player.id).change(function(event) {
						player.setVpForRound(number, event.currentTarget.value);
						player.save();
						that.calculateTpAndVpDiff(that.round, player);
						tournamentStandingsView.render();
					});
				});
			}
		},

		calculateTpAndVpDiff: function(round, player) {
			var i = 1;
			while(round.get('table'+i+'player1')) {
				var player1 = Players.get(round.get('table'+i+'player1'));
				var player2 = Players.get(round.get('table'+i+'player2'));
				if (player1.id === player.id || player2.id === player.id) {
					var player1vp = parseInt(player1.getVpForRound(round.get('number')));
					var player2vp = parseInt(player2.getVpForRound(round.get('number')));
					if (player1vp >= 0 && player1vp <=10 && player2vp >= 0 && player2vp <=10) {
						var diff = player1vp - player2vp;
						player1.setVpDiffForRound(round.get('number'), diff);
						player2.setVpDiffForRound(round.get('number'), -diff);
						player1.setTpForRound(round.get('number'), diff > 0 ? 3 : diff < 0 ? 0: 1);
						player2.setTpForRound(round.get('number'), diff < 0 ? 3 : diff > 0 ? 0: 1);
						player1.save();
						player2.save();
					}
				}
				
				++i;
			}
		},

		generateRounds: function() {
			//TODO validation
			var number = parseInt(this.round.get('number')) + 1;
			Rounds.newRound(number, this.$("#rounds").val());
			router.navigate("#/round/"+ number);
			return false;
		},

	});

	var tournamentRoundView = new TournamentRoundView();

	var Router = Backbone.Router.extend({
	    routes: {
	      "": "settings",
	      "round/:number": "round",
	    }
	});

	var router = new Router;
	router.on('route:settings', function() {
	  tournamentSettingsView.render({});
	});
	router.on('route:round', function(number) {
		tournamentRoundView.render(number);
		tournamentRoundView.registerListeners(number);
		// tournamentStandingsView.render();
	});

    Backbone.history.start();
  
});