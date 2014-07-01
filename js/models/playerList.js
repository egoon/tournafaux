"use strict";
define([
  'underscore',
  'backbone',
  'localstorage'
], function(_, Backbone, localstorage) {
  var BYE_SCORE = "-";
  var Player = Backbone.Model.extend({

    initialize: function() {

    },

    getPreviousOpponents: function(number) {
      var i = 1;
      var opponents = [];
      while (this.get("opponent"+i)) {
        opponents.push(this.get("opponent"+i))
        i++;
      }
      return _.last(opponents, number);
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
      if (this.isNonCompeting()) //the bye or non-competing ringer
        return -1000000;
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
      return this.countPointsWithBye('vp', 0);
    },

    getVpDiff: function() {
      return this.countPointsWithBye('vpdiff', 0);
    },

    getBestMatches: function(players, swissThreshold) {
      var that = this;

      var prevOpps = this.getPreviousOpponents(swissThreshold);

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
        if (that.getCity() != '' && that.getCity() == player.getCity()) return false;
        if (that.getFaction() != '' && that.getFaction() == player.getFaction()) return false;
        return true;
      });

      return possibleOpps;
    },

    getVpForRound: function(round) { return this.get('vp'+round);},
    setVpForRound: function(round, vp) { return this.set('vp'+round, ""+vp);},
    //getVpDiffForRound: function(round) { return this.get('vpdiff'+round);},
    setVpDiffForRound: function(round, vpdiff) { return this.set('vpdiff'+round, ""+vpdiff);},
    //getTpForRound: function(round) { return this.get('tp'+round);},
    setTpForRound: function(round, tp) { return this.set('tp'+round, ""+tp);},
    getOpponentForRound: function(round) { return this.get('opponent'+round);},
    setOpponentForRound: function(round, opponent) { return this.set('opponent'+round, ""+opponent);},
    //getTableForRound: function(round) { return this.get('table'+round);},
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
      this.unset('active');
    },

    isBye: function() {
      return this.get('bye') == 'true';
    },

    isRinger: function() {
      return this.get('ringer') == 'true';
    },

    setBye: function(isBye) {
      if (isBye) {
        this.set('ringer', 'false');
      }
      this.set('bye', isBye.toString());
    },

    setRinger: function(isRinger) {
      if (isRinger) {
        this.set('bye', 'false');
      }
      this.set('ringer', isRinger.toString());
    },

    isNonCompeting: function() {
      return this.get('nonCompeting') == 'true';
    },

    setNonCompeting: function(nonCompeting) {
      this.set('nonCompeting', nonCompeting.toString());
    },

    isActive: function() {
      return this.get('active') != 'false';
    },

    setActive: function(active) {
      this.set('active', active.toString());
    },

    getName: function() {
      var name = this.get('name');
      if (this.isBye()) return 'Bye';
      if (this.isRinger() && !name) return 'Ringer';
      if (this.isRinger()) return name + ' (Ringer)';
      if (!this.get('name')) return '[No Name]';
      return this.get('name');
    },

    setName: function(name) {
      this.set('name', name);
    },

    getCity: function() {
      if (this.isNonCompeting()) return '';
      if (!this.get('city')) return '';
      return this.get('city');
    },

    setCity: function(city) {
      this.set('city', city);
    },

    getFaction: function() {
      if (this.isNonCompeting()) return '';
      if (!this.get('faction')) return '';
      return this.get('faction');
    },

    setFaction: function(faction) {
      this.set('faction', faction);
    }

  });

	var PlayerList = Backbone.Collection.extend({

		model: Player,

    initialize: function(options) {

    },
	
		localStorage: new Backbone.LocalStorage("tournafaux-players"),

    getAllPlayers: function() {
      return this.models;
    },

    getActivePlayers: function() {
      var players = this.filter(function(player) { return player.isActive(); });
      return players;
    },

    getCompetingPlayers: function() {
      var players = this.filter(function(player) { return player.isActive() && !player.isNonCompeting(); });
      return players;
    },

    getByeRinger: function() {
      var ringer = this.find(function(player) { return player.isBye() || player.isRinger(); });
      if (!ringer)
        return this.create({name: 'Ringer', nonCompeting: 'true', bye: 'true', active: 'false'});
      else
        return ringer;
    }

	});
  return PlayerList;
});