define([
  'underscore',
  'backbone',
  'localstorage'
], function(_, Backbone, localstorage) {
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
  return PlayerList;
});