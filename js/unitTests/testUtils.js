"use strict";
define([
	'jquery',
  'underscore'
], function($, _) {
  var Utils = {
    playGame: function(round, player1, player2, scoreP1, scoreP2) {
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
    }
  };
  return Utils;
});