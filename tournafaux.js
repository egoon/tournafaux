$(function() {

	var BYE_ID = "0";
	var BYE_SCORE = "-";
	var SETTINGS_ID ="settings";

 	document.title="Tournafaux";

 	window.applicationCache.addEventListener('updateready', function(e) {
    	if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      		// Browser downloaded a new app cache.
      		if (confirm('A new version of this site is available. Load it?')) {
        		window.location.reload();
      		}
    	} 
  	}, false);

  	var showHelpBye = function () {
		$("#help").html("<h4>Bye</h4>If the tournament has an uneven amount of players, "+
		 "a Bye (-) is created. The player that was matched against the bye will score an average of " + 
		 "all games. This will be recalculated after every round. If the player has played no games, she "+
		 "will have 1 TP and 1 VP temporarily. The bye will always score 0 TP and 0 VP. It is therefore " + 
		 "more likely for players in the bottom of the table to get a bye.<hr/>");
  	};

  	var showHelpCityFaction = function() {
  		$("#help").html("<h4>City/Club and Faction</h4>If you fill these fields, players from the same city, "+
		"or playing the same faction, will not face each other in the first game. If possible.<hr/>");
  	};

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

    	getDissimilarPlayers: function(players) {
    		var that = this;

    		var possibleOpps = _.filter(players, function(player) {
    			if (that.id == player.id) return false;
    			if (that.get('city') != '' && that.get('city') == player.get('city')) return false;
    			if (that.get('faction') != '' && that.get('faction') == player.get('faction')) return false;
    			return true;
    		});

    		return possibleOpps;
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


	var Round = Backbone.Model.extend({});

	var RoundList = Backbone.Collection.extend({

		model: Round,

		localStorage: new Backbone.LocalStorage("tournafaux-rounds"),

		newRound: function(number) {



			var round = _.find(this.models, function(round){ return round.get("number") == ""+number});
			
			if (!round) {
				round = this.create({number: ""+number});
			} else {
				_.each(Players.models, function(p) {p.unset("opponent"+number)});
			}

			// Create bye if needed
			if (Players.models.length % 2 == 1)
				Players.create({id:BYE_ID, name:"-"});

			var players = Players.models;
			var matches = [];

			if (number == 1 || number == "1") {
				_.each(players, function(player) {
					matches.push({player: player, matches: player.getDissimilarPlayers(Players.models)});
				});
			} else {
				_.each(players, function(player) {
					matches.push({player: player, matches: player.getBestMatches(Players.models)});
				});
			}

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
				// if no match can be found, just take the next player
				if (!player2) 
					player2 = matches.pop().player;


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

	var Settings = Backbone.Model.extend({

        localStorage: new Backbone.LocalStorage("tournafaux-settings"),

    });

	var TournamentSettingsView = Backbone.View.extend({
		
		el: '.page',

		events: {
			"keypress #new-player": "createOnEnter",
			"click button.removePlayer": "removePlayer",
			"click #generate-round": "generateRound",
			"change #rounds": "changeRounds",
			"change input.city": "updateCity",
			"change input.faction": "updateFaction",
			"click #helpCityFaction": "showHelpCityFaction",
		},

		model: Settings,
		
		initialize: function() {
			Players.fetch();
			Rounds.fetch();

			this.settings = new Settings({id: SETTINGS_ID, rounds: "3"});
			this.settings.fetch();
			
			this.registerListeners();
		},

		registerListeners: function() {
			this.listenTo(Players, 'change', this.render);
			this.listenTo(Players, 'remove', this.render);
			this.listenTo(Players, 'reset', this.render);
			this.listenTo(this.settings, 'change', this.render);
		},

		unregisterListeners: function() {
			this.stopListening(Players);
			this.stopListening(this.settings);
		},
		
		render: function(options) {
			
			var template = _.template($('#tournament-settings-template').html(), {players: Players, settings: this.settings});
	      	this.$el.html(template);
	      	this.newPlayer = this.$("#new-player");
		},

		createOnEnter: function(e) {
			if (e.keyCode != 13 && e.keyCode != 9) return;
			if (!this.newPlayer.val()) return;

			var player = Players.create({name: this.newPlayer.val(), city: '', faction: ''});

			this.newPlayer.val('');
			this.$("#"+player.id+".city").focus();
		},

		removePlayer: function(e) {
			// console.log(Players.get(e.currentTarget.id.replace("remove-", "")));
			// console.log(e.currentTarget.id);
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

		updateCity: function(e) {
			var player = Players.get(e.currentTarget.id);
			player.set('city', e.currentTarget.value);
			player.save();
			this.$("#"+player.id +".faction").focus();
			return false;
		},

		updateFaction: function(e) {
			var player = Players.get(e.currentTarget.id);
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
			Rounds.newRound(1);
			router.navigate("#/round/1");
			return false;
		},

		showHelpCityFaction: function(e) {
			showHelpCityFaction();
		},
	});

	var tournamentSettingsView = new TournamentSettingsView();

	var TournamentStandingsView = Backbone.View.extend({

		el: '.standings',

		initialize: function() {
			// this.listenTo(Players, 'change', this.render);

		},

		events: {
			"click #helpBye": "showHelpBye",
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

		showHelpBye: function(e) {
			showHelpBye();
		},
	});

	var tournamentStandingsView = new TournamentStandingsView();

	var TournamentRoundView = Backbone.View.extend({

		el: '.page',

		initialize: function() {
			this.settings = new Settings({id: SETTINGS_ID});
		},

		events: {
			"click #generate-rounds": "generateRounds",
			"click #helpBye": "showHelpBye",
		},

		render: function(number) {
			console.log("render");
			Players.fetch();
			Rounds.fetch();
			this.settings.fetch();
			console.log(this.settings);

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

				var template = _.template($('#tournament-round-template').html(), {number: this.round.get('number'), tables: tables, settings: this.settings});
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
						if (parseInt(event.currentTarget.value) >= 0) {
							player.setVpForRound(number, event.currentTarget.value);
						} else {
							event.currentTarget.value = '0';
							player.setVpForRound(number, '0');
						}
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

		generateRounds: function() {
			//TODO validation
			var number = parseInt(this.round.get('number')) + 1;
			Rounds.newRound(number);
			router.navigate("#/round/"+ number);
			return false;
		},

		showHelpBye: function(e) {
			showHelpBye();
		},

	});

	var tournamentRoundView = new TournamentRoundView();

	var TournamentNavView = Backbone.View.extend({
		el: '#tournament-nav',

		render: function(active) {
			Rounds.fetch();
			
			var template = _.template($('#tournament-nav-template').html(), {rounds: Rounds, active: active});
		    this.$el.html(template);
		},
	});

	var tournamentNavView = new TournamentNavView();

	var Router = Backbone.Router.extend({
	    routes: {
	      "": "settings",
	      "round/:number": "round",
	    }
	});

	var router = new Router;
	router.on('route:settings', function() {
		tournamentSettingsView.registerListeners();
		tournamentSettingsView.render({});
		tournamentNavView.render("settings");
	});
	router.on('route:round', function(number) {
		tournamentSettingsView.unregisterListeners();
		tournamentRoundView.render(number);
		tournamentRoundView.registerListeners(number);
		tournamentNavView.render(number);
		// tournamentStandingsView.render();
	});

    Backbone.history.start();
  
});