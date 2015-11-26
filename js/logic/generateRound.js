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
/*globals define*/
define([
  'underscore'
], function(_) {
  "use strict";
	var BYE_SCORE = "-";

	var setScoresForBye = function(bye, opp, number) {
    bye.setVpForRound(number, 0);
    opp.setVpForRound(number, BYE_SCORE);
    opp.setVpDiffForRound(number, BYE_SCORE);
    opp.setTpForRound(number, BYE_SCORE);
	};

	var matchPlayers2 = function(players, isLegalMatch) {
		if (players.length == 0) { return []; }
		var player = players[0];
		players = players.slice(1);
		var possibleMatches = players.filter(function(p) { return isLegalMatch(player, p); });
		console.log(player.getName() + ": " + _.map(possibleMatches, function(pm) {return pm.getName()}).join());
		while (possibleMatches.length > 0) {
			var possibleMatch = possibleMatches[0];
			possibleMatches = possibleMatches.slice(1);
			var match = matchPlayers2(_.without(players, possibleMatch), isLegalMatch);
			if (match) {
				return [{player1: player, player2: possibleMatch}].concat(match);
				
			}
		}
		return false;
	};

	var matchPlayers = function(players, matchedPlayers, roundLookBack) {
		console.log("matchPlayers");
		var match = matchPlayers2(players, function(p1, p2) { return !p1.isPreviousOpponent(p2, roundLookBack)});
		if (!match) {
			console.log("match failed");
			return matchPlayers(players, matchPlayers, roundLookBack - 1);
		}
		return matchedPlayers.concat(match);
		// if (players.length === 0) {
		// 	return matchedPlayers;
		// }
		// var i, player, matched;
		// player = players[0];
		// players = _.without(players, player);
		// for (i = 0; i < players.length; ++i) {
		// 	if (!player.isPreviousOpponent(players[i], roundLookBack)) {
		// 		matched = matchPlayers(
		// 			_.without(players, players[i]),
		// 			matchedPlayers.concat([{player1: player, player2: players[i]}]),
		// 			roundLookBack);
		// 		if (matched) { return matched; }
		// 	}
		// }
		// return false;
	};

	var matchPlayersFirstRound = function(players, matchedPlayers) {
		console.log("matchPlayersFirstRound");
		var match = matchPlayers2(players, function(p1, p2) { return p1.isPossibleFirstOpponent(p2)});
		if (!match) {
			match = matchPlayers2(players, function(p1, p2) { return true; });
		}
		return matchedPlayers.concat(match);
		// if (players.length === 0) {
		// 	return matchedPlayers;
		// }
		// var i, player, matched;
		// player = players[0];
		// players = _.without(players, player);
		// for (i = 0; i < players.length; ++i) {
		// 	if (player.isPossibleFirstOpponent(players[i])) {
		// 		matched = matchPlayersFirstRound(
		// 			_.without(players, players[i]),
		// 			matchedPlayers.concat([{player1: player, player2: players[i]}]));
		// 		if (matched) { return matched; }
		// 	}
		// }
		// return false;
	};

	var generate = function(number, playerList, roundList, settings) {
		var i, j;
		roundList.fetch();
		playerList.fetch();

		var round = _.find(roundList.models, function(round){ return round.get("number") === number.toString(); });
		if (round) {
      playerList.each(function(player) {
        player.clearGame(number);
      });
      // TODO: clear the tables
    } else {
		  round = roundList.create({number: number.toString()});
    }


		// Toggle active bye/ringer as needed
    var byeRinger = playerList.getByeRinger();
		if (playerList.getActivePlayers().length % 2 === 1) {
      byeRinger.setActive(!byeRinger.isActive());
      //TODO: set non competing?
      byeRinger.save();
    }


		var players = playerList.getCompetingPlayers();

		var matchedPlayers = [];

    //match the worst player without a previous bye to the bye
    if (byeRinger.isActive() && byeRinger.isNonCompeting()) {
      for (i = players.length - 1; i >= 0; --i) {
        if (!players[i].isPreviousOpponent(byeRinger, settings.getRounds())) {
          matchedPlayers.push({player2: byeRinger, player1: players[i]});
          if (byeRinger.isBye()) {
            setScoresForBye(byeRinger, players[i], number);
          }
          players = _.without(players, players[i]);
          break;
        }
      }
    }

    if (number === 1) {
      // grudge matches
      matchedPlayers = matchPlayersFirstRound(players, matchedPlayers);
      // for (i = 0; i < players.length; ++i) {
      //   var opp = players[i].getFirstOpponent();
      //   if (opp) {
      //     for (j = i + 1; j < players.length; ++j) {
      //       if (players[j].id === opp && players[j].getFirstOpponent() === players[i].id) {
      //         matchedPlayers.push({player1: players[i], player2: players[j]});
      //         players = _.without(players, players[i], players[j]);
      //       }
      //     }
      //   }
      // }

      // // city and faction matching
      // var possibleMatches = [];
      // for (i = 0; i < players.length; ++i) {
      //   possibleMatches.push({player: players[i], opps: players[i].getPossibleFirstRoundOpponents(players)});
      // }
      // while (possibleMatches.length > 0) {
      //   possibleMatches = _.sortBy(possibleMatches, function(pm) { return -pm.opps.length;});
      //   match = possibleMatches.pop();
      //   if (match.opps.length > 0) {
      //     var p1 = match.player;
      //     var p2 = match.opps[0];
      //     matchedPlayers.push({player1: p1, player2: p2});
      //     players = _.without(players, p1, p2);
      //     // remove p1 and p2 from possibleMatches
      //     for (i = 0; i < possibleMatches.length; ++i) {
      //       if (possibleMatches[i].player.id === p2.id) {
      //         possibleMatches[i].opps = [];
      //       } else {
      //         possibleMatches[i].opps = _.without(possibleMatches[i].opps, p1, p2);
      //       }
      //     }
      //   }
      // }
    } else {

    	// match remaining players
    	matchedPlayers = matchPlayers(players, matchedPlayers, settings.getRoundLookBack());
	}

		var availableTables = [];
		var noTables = settings.getTables();

		for (i = noTables; i > 0; --i) {
			availableTables.push(i.toString());
		}

		//unplayed tables
		_.each(matchedPlayers, function(m) {
			if (m.player2.isBye()) {
				m.unplayedTables = ['-'];
			} else {
				m.unplayedTables = _.difference(availableTables, m.player1.getPlayedTables(), m.player2.getPlayedTables());
			}
		});
	
		while (matchedPlayers.length > 0) {
//			console.log("tables");
			matchedPlayers = _.sortBy(matchedPlayers, function(players) { 
				return players.unplayedTables.length > 0 ? -players.unplayedTables.length : -1000;
			});
//			console.log(matchedPlayers);
			var match = matchedPlayers.pop();
//			console.log(match.player1.getName() +", " + match.player2.getName() + ": "+ match.unplayedTables.toString());
//			console.log(match.unplayedTables);
			var selectedTable;

			if (match.unplayedTables.length > 0) {
				selectedTable = match.unplayedTables.pop();
			} else {
				selectedTable = availableTables.pop();
			}
			availableTables = _.without(availableTables, selectedTable);
			_.each(matchedPlayers, function(players) {players.unplayedTables = _.without(players.unplayedTables, selectedTable)});


//			console.log(selectedTable);
			match.player1.set('table'+number, selectedTable);
			match.player2.set('table'+number, selectedTable);
			match.player1.setOpponentForRound(number, match.player2.id);
			match.player2.setOpponentForRound(number, match.player1.id);
			match.player1.save();
			match.player2.save();
			round.set('table'+selectedTable+'player1', match.player1.id);
			round.set('table'+selectedTable+'player2', match.player2.id);
			round.save();
			// console.log(round);
		}
		
		return round;

	};



	return {generate: generate};
});