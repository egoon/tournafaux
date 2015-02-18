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

	var matchPlayers = function(players, matchedPlayers, roundLookBack) {
		if (players.length === 0) {
			return matchedPlayers;
		}
		var i, player, matched;
		player = players[0];
		players = _.without(players, player);
		for (i = 0; i < players.length; ++i) {
			if (!player.isPreviousOpponent(players[i], roundLookBack)) {
				matched = matchPlayers(
					_.without(players, players[i]),
					matchedPlayers.concat([{player1: player, player2: players[i]}]),
					roundLookBack);
				if (matched) { return matched; }
			}
		}
		return false;
	};

	var matchPlayersFirstRound = function(players, matchedPlayers) {
		if (players.length === 0) {
			return matchedPlayers;
		}
		var i, player, matched;
		player = players[0];
		players = _.without(players, player);
		for (i = 0; i < players.length; ++i) {
			if (player.isPossibleFirstOpponent(players[i])) {
				matched = matchPlayersFirstRound(
					_.without(players, players[i]),
					matchedPlayers.concat([{player1: player, player2: players[i]}]));
				if (matched) { return matched; }
			}
		}
		return false;
	};

	var generate = function(number, playerList, roundList, settings) {
		var i;
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

		//if (number > 1) {
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

			// match remaining players
			//players = _.shuffle(players);
			matchedPlayers = matchPlayers(players, matchedPlayers, settings.getRoundLookBack());

		//} else {
		//	players = _.shuffle(players);
		//	if (byeRinger.isActive() && byeRinger.isNonCompeting()) {
		//		var player = players.pop();
		//		matchedPlayers.push({player2: byeRinger, player1: player});
		//		if (byeRinger.isBye()) {
		//			setScoresForBye(byeRinger, player, number);
		//		}
    //
		//	}
    //
		//	matchedPlayers = matchPlayersFirstRound(players, matchedPlayers);
    //
		//}



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