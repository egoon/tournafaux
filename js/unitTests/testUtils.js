"use strict";
define([
	'jquery',
  'underscore'
], function($, _) {
  var Utils = {
    playGame: function(round, player1, player2, scoreP1, scoreP2, table) {
      if (scoreP1 > scoreP2) {
        player1.setVpTpAndDiffForRound(round, scoreP1, 3, scoreP1 - scoreP2);
        player2.setVpTpAndDiffForRound(round, scoreP2, 0, scoreP2 - scoreP1);
      } else if (scoreP1 < scoreP2) {
        player1.setVpTpAndDiffForRound(round, scoreP1, 0, scoreP1 - scoreP2);
        player2.setVpTpAndDiffForRound(round, scoreP2, 3, scoreP2 - scoreP1);
      } else {
        player1.setVpTpAndDiffForRound(round, scoreP1, 1, scoreP1 - scoreP2);
        player2.setVpTpAndDiffForRound(round, scoreP2, 1, scoreP2 - scoreP1);
      }
      player1.setOpponentForRound(round, player2.id);
      player2.setOpponentForRound(round, player1.id);
      player1.setTableForRound(round, table);
      player2.setTableForRound(round, table);
    },
    createPlayers: function(playerList, numberOfPlayers) {
      var players = [];
      for (var i = 0; i < numberOfPlayers; ++i) {
        players[i] = playerList.create({name: String.fromCharCode(65 + i)});
      }
      return players;
    },
    createSimpleFirstRound: function(playerList, roundList) {
      var round = roundList.create({number: '1'});
      for (var i = 0; i < playerList.length / 2; ++i) {
        round.set('table'+(i+1)+'player1', playerList.at(2*i).id);
        round.set('table'+(i+1)+'player2', playerList.at(2*i + 1).id);
      }
      round.save();
      return round;
    }
  };
  return Utils;
});