"use strict";
define([
  'underscore',
  'backbone',
  'localstorage'
], function(_, Backbone, localstorage) {
    var BYE_SCORE = "-";
    var Player = Backbone.Model.extend({

		initialize: function() {

      		if (!this.get("name")) {
        		this.set("name", "No name?");
      		}
            if (!this.get("city")) {
                this.set("city", "");
            }
            if (!this.get("faction")) {
                this.set("faction", "");
            }
            if (!this.get("active")) {
                this.set("active", "true");
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

        getPlayedTables: function() {
            var i = 1;
            var tables = [];
            while (this.get("table"+i)) {
                tables.push(this.get("table"+i))
                i++;
            }
            return tables;
        },

    	countPointsWithBye: function(pointType, byeScore) {
            if (this.id == "0") //the bye
                return -1;
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
    		return Math.round(total*10)/10;
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
            // console.log("bestMatches");
    		var that = this;

    		var prevOpps = this.getPreviousOpponents();

            // console.log(this.get('name') + ": " + prevOpps.length)

    		var possibleOpps = _.filter(players, function(player) {
    			if (that.id == player.id) return false;
    			return _.indexOf(prevOpps, player.id) == -1;
    		});

            // console.log(_.reduce(possibleOpps, function(memo, o){ return memo + o.get('name') + ", "}, this.get('name') + ": "))
    		
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
        getTableForRound: function(round) { return this.get('table'+round);},
        setTableForRound: function(round, table) { return this.set('table'+round, ""+table);},

        setVpTpAndDiffForRound: function(round, vp, tp, diff) {
            this.setVpForRound(round, vp);
            this.setTpForRound(round, tp);
            this.setVpDiffForRound(round, diff);
        },

    	clearGames: function(number) {
            for(var i = 1; i <= number; ++i) {
				this.unset('vp'+i);
				this.unset('vpdiff'+i);
				this.unset('tp'+i);
				this.unset('opponent'+i);
                this.unset('table'+i);
			}
    	},

	});

	var PlayerList = Backbone.Collection.extend({

		model: Player,

        initialize: function(options) {
            // if (options && options.localStorageId)
            //     this.localStorage = new Backbone.LocalStorage(options.localStorageId);
            
        },
	
		localStorage: new Backbone.LocalStorage("tournafaux-players"),

	});
  return PlayerList;
});