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

	var setScoresForBye = function(bye, opp, number) {
        bye.setVpTpAndDiffForRound(number, 5, 0, -5);
        opp.setVpTpAndDiffForRound(number, 10, 3, 5);
	};

	var matchPlayers2 = function(players, isLegalMatch) {
		if (players.length == 0) { return []; }
		var player = players[0];
		players = players.slice(1);
		var possibleMatches = players.filter(function(p) { return isLegalMatch(player, p); });
		// console.log(player.getName() + ": " + _.map(possibleMatches, function(pm) {return pm.getName()}).join());
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
		// console.log("matchPlayers");
		var match = matchPlayers2(players, function(p1, p2) { return !p1.isPreviousOpponent(p2, roundLookBack)});
		if (!match) {
			console.log("match failed");
			return matchPlayers(players, matchedPlayers, roundLookBack - 1);
		}
		return matchedPlayers.concat(match);

	};

	var matchPlayersFirstRound = function(players, matchedPlayers) {
		// console.log("matchPlayersFirstRound");
		var match = matchPlayers2(players, function(p1, p2) { return p1.isPossibleFirstOpponent(p2)});
		if (!match) {
			match = matchPlayers2(players, function(p1, p2) { return true; });
		}
		return matchedPlayers.concat(match);
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
			match.player1.setOpponentIdForRound(number, match.player2.id);
			match.player2.setOpponentIdForRound(number, match.player1.id);
			match.player1.save();
			match.player2.save();
			round.set('showInNav', 'true');
			round.setPlayersForTable(selectedTable, match.player1, match.player2);
			// round.set('table'+selectedTable+'player1', match.player1.id);
			// round.set('table'+selectedTable+'player2', match.player2.id);
			round.save();
			// console.log(round);
		}
		
		return round;
	};

	var switchPlayers = function (player1, player2, round) {
        var table1 = round.getTable(player1.getTableForRound(round.getNumber())),
            table2 = round.getTable(player2.getTableForRound(round.getNumber()));
        switchPlayerAtTable(player1, player2, table1, round);
        switchPlayerAtTable(player2, player1, table2, round);
	};

    var switchPlayerAtTable = function(oldPlayer, newPlayer, table, round) {
        var roundNumber = round.getNumber();
        if (table.player1id === oldPlayer.id) {
            round.setPlayer1ForTable(table.name, newPlayer);
            newPlayer.setOpponentIdForRound(roundNumber, table.player2id);
        } else {
            round.setPlayer2ForTable(table.name, newPlayer);
            newPlayer.setOpponentIdForRound(roundNumber, table.player1id);
        }
        newPlayer.setTableForRound(roundNumber, table.name);
        var opponent = newPlayer.getOpponentForRound(roundNumber);
        if (opponent.isBye())
            setScoresForBye(opponent, newPlayer, roundNumber);
        else {
            newPlayer.setVpTpAndDiffForRound(roundNumber, 0, 0, 0);
            opponent.setVpTpAndDiffForRound(roundNumber, 0, 0, 0);
        }
        opponent.save();
        round.save();
        newPlayer.save();
    };

	return {generate: generate, setScoresForBye: setScoresForBye, switchPlayers: switchPlayers};
});