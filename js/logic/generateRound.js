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
define([
  'underscore',
], function(_) {
  "use strict";
	var BYE_SCORE = "-";

	var setScoresForBye = function(bye, opp, number) {

    bye.setVpForRound(number, 0);
    opp.setVpForRound(number, BYE_SCORE);
    opp.setVpDiffForRound(number, BYE_SCORE);
    opp.setTpForRound(number, BYE_SCORE);


	};

  	var generate = function(number, playerList, roundList, settings) {

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

		// find possible opponents for each player

		var players = playerList.getActivePlayers();
      console.log(players);
      console.log(playerList.getAllPlayers());

		var possibleMatches = [];
		if (number === 1 || number === "1") {
			_.each(players, function(player) {
				possibleMatches.push({player: player, matches: player.getPossibleFirstRoundOpponents(players)});
			});
		} else {
			_.each(players, function(player) {
        var swissThreshold = settings.getTournamentType() === settings.GG14_SWISS && !player.isBye() ? 2 : settings.getRounds();
				possibleMatches.push({player: player, matches: player.getBestMatches(players, swissThreshold)});
        if (player.isBye()) {
        }
			});
		}


		// assign opponents

		var matchedPlayers = [];
		while (possibleMatches.length > 0) {

			possibleMatches = _.shuffle(possibleMatches);
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getTotalVp()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getVpDiff()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getTotalTp()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return match.matches.length > 0 ? -match.matches.length : -100000});
//			console.log("matching");
      // console.log(_.reduce(possibleMatches, function(memo, match) { return memo + match.player.getName() + " " + match.matches.length + ", "}, ""));

      var match = _.find(possibleMatches, function(match) { return match.player.isNonCompeting()});
      // match bye or non-competing ringer first
      if (match) {
        possibleMatches = _.reject(possibleMatches, function(match) { return match.player.isNonCompeting()});
      } else {
        match = possibleMatches.pop();
      }

			var player1 = match.player;
			var player2 = match.matches.pop();
			// if no match can be found, just take the next player
			if (!player2) {
				player2 = possibleMatches.pop().player;
			}
//			console.log(player1.getName() + " vs " + player2.getName());
			// remove player2 from possibleMatches
			possibleMatches = _.reject(possibleMatches, function(m) {return m.player.id == player2.id});

			// remove player1 and player2 form remaining players matches
			_.each(possibleMatches, function(match) {
				match.matches = _.reject(match.matches, function(m) { 
					return m.id == player1.id || m.id == player2.id; 
				});
//				console.log(_.reduce(match.matches, function(memo, m) { return memo + m.getName() +", "},  match.player.getName() + ": "));
			});

			player1.set("opponent" + number, player2.id);
			player2.set("opponent" + number, player1.id);
			if (player1.isBye())
				setScoresForBye(player1, player2, number);
			if (player2.isBye())
				setScoresForBye(player2, player1, number);

			matchedPlayers.push({
				player1: player1, 
				player2: player2, 
				playedTables: _.union(player1.getPlayedTables(), player2.getPlayedTables())
			});
		}

		// assign tables
		var tablesNumbers = [];
		var noTables = settings.getTables();

		for (var i = noTables; i > 0; --i) 
			tablesNumbers.push(i.toString());

    _.each(matchedPlayers, function(players) {
      players.unplayedTables = _.filter(tablesNumbers, function(number) {return !_.contains(players.playedTables, number)});
    });
	
		while (matchedPlayers.length > 0) {
//			console.log("tables");
			matchedPlayers = _.sortBy(matchedPlayers, function(players) { 
				return players.unplayedTables.length > 0 ? -players.unplayedTables.length : -1000;
			});
//			console.log(matchedPlayers);
			match = matchedPlayers.pop();
//			console.log(match.player1.getName() +", " + match.player2.getName() + ": "+ match.unplayedTables.toString());
//			console.log(match.unplayedTables);
			var selectedTable;
			if (match.player1.isBye() || match.player2.isBye()) {
				selectedTable = '-';
			} else {
				if (match.unplayedTables.length > 0) {
					selectedTable = match.unplayedTables.pop();
				} else {
          selectedTable = tablesNumbers.pop();
        }
        tablesNumbers = _.without(tablesNumbers, selectedTable);
				_.each(matchedPlayers, function(players) {players.unplayedTables = _.without(players.unplayedTables, selectedTable)});
			}

//			console.log(selectedTable);
			match.player1.set('table'+number, selectedTable);
			match.player2.set('table'+number, selectedTable);
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