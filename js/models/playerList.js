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
/*global define*/
define([
  'underscore',
  'backbone',
  'localstorage'
], function (_, Backbone) {
  "use strict";
  var BYE_SCORE = "-";
  var Player = Backbone.Model.extend({

    initialize: function (options) {
      this.settings = options.settings;
      this.setActive(false);
    },

    getPreviousOpponents: function (number) {
      var i = 1;
      var opponents = [];
      while (this.get("opponent" + i)) {
        opponents.push(this.get("opponent" + i));
        i++;
      }
      return _.last(opponents, number);
    },

    isPreviousOpponent: function(player, roundLookBack) {
      var pid = typeof player === 'string' ? player : player.id;
      return _.any(this.getPreviousOpponents(roundLookBack), function(oppid) { return oppid === pid; });
    },

    getPlayedTables: function () {
      var i = 1;
      var tables = [];
      while (this.get("table" + i)) {
        tables.push(this.get("table" + i));
        i++;
      }
      return tables;
    },

    getTotalTp: function () {
      var round;
      var total = 0;
      for (round = 1; this.get('tp'+round); ++round) {
        total += this.getTpForRound(round);
      }
      return total;
    },

    getTotalVp: function () {
      var round;
      var total = 0;
      for (round = 1; this.get('vp'+round); ++round) {
        total += this.getVpForRound(round);
      }
      return total;
    },

    getVpDiff: function () {
      var round;
      var total = 0;
      for (round = 1; this.get('vpdiff'+round); ++round) {
        total += this.getVpDiffForRound(round);
      }
      return total;
    },

    isPossibleFirstOpponent: function(player) {
      if (this.getFirstOpponent()) {
        if (this.getFirstOpponent() === player.id) {
          return true;
        }
        return false;
      }
      if (this.getFaction() !== '' && this.getFaction() === player.getFaction()) {
        return false;
      }
      if (this.getCity() !== '' && this.getCity() === player.getCity()) {
        return false;
      }
      return true;
    },


      getPossibleFirstRoundOpponents: function (players) {
      var that = this;
      if (this.getFirstOpponent()) {
        return [_.find(players, function (player) {
          return player.id === that.getFirstOpponent();
        })];
      }

      var possibleOpps = _.filter(players, function (player) {
        if (that.id === player.id) { return false; }
        if (that.getCity() !== '' && that.getCity() === player.getCity()) { return false; }
        if (that.getFaction() !== '' && that.getFaction() === player.getFaction()) { return false; }
        return true;
      });

      return possibleOpps;
    },

    getValueForRound: function (valueType, round) {

      if (this.isBye()) {
        return -10000000;
      }
      var value = this.get(valueType + round);
      var that = this;
      round = parseInt(round, 10);
      var rounds = round;
      while(this.get(valueType + (rounds + 1))) {rounds++; }
      if (value !== BYE_SCORE) {
        return parseInt(value, 10);
      }
      var settings = this.collection.settings;

      if (settings.getBye() === settings.GG14_BYE) {
        switch (valueType) {
        case 'tp':
          return 3;
        case 'vp':
          return 10;
        case 'vpdiff':
          return 5;
        default:
          return NaN;
        }
      }
      if (settings.getBye() === settings.AVERAGE_BYE) {
        if (rounds === 1) {
          switch (valueType) {
          case 'tp':
            return 1;
          case 'vp':
            return 0;
          case 'vpdiff':
            return 0;
          default:
            return NaN;
          }
        }
        return _.reduce(_.range(1, rounds + 1), function (memo, num) {
          if (isNaN(that.get(valueType + num))) {
            return memo;
          }
          return memo + parseInt(that.get(valueType + num), 10);
        }, 0) / (rounds - 1);
      }

    },

    getVpForRound: function (round) {
      return this.getValueForRound('vp', round);
    },
    setVpForRound: function (round, vp) {
      return parseInt(this.set('vp' + round, vp.toString()), 10);
    },
    getVpDiffForRound: function (round) {
      return this.getValueForRound('vpdiff', round);
    },
    setVpDiffForRound: function (round, vpdiff) {
      return parseInt(this.set('vpdiff' + round, vpdiff.toString()), 10);
    },
    getTpForRound: function (round) {
      return this.getValueForRound('tp', round);
    },
    setTpForRound: function (round, tp) {
      return parseInt(this.set('tp' + round, tp.toString()), 10);
    },
    getOpponentForRound: function (round) {
      return this.get('opponent' + round);
    },
    setOpponentForRound: function (round, opponent) {
      if (typeof opponent !== 'string')
        throw "opponent should be an id";
      return this.set('opponent' + round, opponent);
    },
    //getTableForRound: function(round) { return this.get('table'+round);},
    setTableForRound: function (round, table) {
      return this.set('table' + round, table.toString());
    },

    setVpTpAndDiffForRound: function (round, vp, tp, diff) {
      this.setVpForRound(round, vp);
      this.setTpForRound(round, tp);
      this.setVpDiffForRound(round, diff);
    },

    clearGames: function (number) {
      var i;
      for (i = 1; i <= number; ++i) {
        this.clearGame(i);
      }
      this.unset('active');
    },

    clearGame: function (roundNumber) {
      this.unset('vp' + roundNumber);
      this.unset('vpdiff' + roundNumber);
      this.unset('tp' + roundNumber);
      this.unset('opponent' + roundNumber);
      this.unset('table' + roundNumber);
    },

    isBye: function () {
      return this.get('bye') === 'true';
    },

    isRinger: function () {
      return this.get('ringer') === 'true';
    },

    setBye: function (isBye) {
      if (isBye) {
        this.set('ringer', 'false');
      }
      this.set('bye', isBye.toString());
    },

    setRinger: function (isRinger) {
      if (isRinger) {
        this.set('bye', 'false');
      }
      this.set('ringer', isRinger.toString());
    },

    isNonCompeting: function () {
      return this.get('nonCompeting') === 'true';
    },

    setNonCompeting: function (nonCompeting) {
      this.set('nonCompeting', nonCompeting.toString());
    },

    isActive: function () {
      return this.get('active') !== 'false';
    },

    setActive: function (active) {
      this.set('active', active.toString());
    },

    getName: function () {
      var name = this.get('name');
      if (this.isBye()) { return 'Bye'; }
      if (this.isRinger() && !name) { return 'Ringer'; }
      if (this.isRinger()) { return name + ' (Ringer)'; }
      if (!this.get('name')) { return '[No Name]'; }
      return this.get('name');
    },

    setName: function (name) {
      this.set('name', name);
    },

    getCity: function () {
      if (this.isNonCompeting()) { return ''; }
      if (!this.get('city')) { return ''; }
      return this.get('city');
    },

    setCity: function (city) {
      this.set('city', city);
    },

    getFaction: function () {
      if (this.isNonCompeting()) { return ''; }
      if (!this.get('faction')) { return ''; }
      return this.get('faction');
    },

    setFaction: function (faction) {
      this.set('faction', faction);
    },

    getFirstOpponent: function () {
      return this.get('firstOpponent');
    },

    setFirstOpponent: function (firstOpponent) {
      this.set('firstOpponent', firstOpponent);
      this.save();
    }

  });

  var PlayerList = Backbone.Collection.extend({

    model: Player,

    localStorage: new Backbone.LocalStorage("tournafaux-players"),

    initialize: function(options) {
      this.settings = options.settings;
    },

    getAllPlayers: function () {
      return this.models;
    },

    getActivePlayers: function () {
      var players = this.filter(function (player) {
        return player.isActive();
      });
      return players;
    },

    getCompetingPlayers: function () {
      var players = this.filter(function (player) {
        return player.isActive() && !player.isNonCompeting();
      });
      players = _.sortBy(players, function(p) {return -p.getTotalVp();});
      players = _.sortBy(players, function(p) {return -p.getVpDiff();});
      players = _.sortBy(players, function(p) {return -p.getTotalTp();});
      return players;
    },

    getByeRinger: function () {
      var ringer = this.find(function (player) {
        return player.isBye() || player.isRinger();
      });
      if (!ringer) {
        return this.create({name: 'Ringer', nonCompeting: 'true', bye: 'true', active: 'false'});
      }
      return ringer;
    }

  });
  return PlayerList;
});