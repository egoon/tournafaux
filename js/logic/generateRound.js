define([
  'underscore',
], function(_) {
	var BYE_SCORE = "-";

	var setScoresForBye = function(bye, opp, number, type) {
		if (type == "average-bye") {
			bye.setVpForRound(number, 0);
			opp.setVpForRound(number, BYE_SCORE);
			opp.setVpDiffForRound(number, BYE_SCORE);
			opp.setTpForRound(number, BYE_SCORE);
		} else if (type == "gg14-bye") {
			bye.setVpForRound(number, 5);
			opp.setVpForRound(number, 10);
			opp.setVpDiffForRound(number, 5);
			opp.setTpForRound(number, 3);
		}
	};

  	var generate = function(number, playerList, roundList, settings) {

		roundList.fetch();
		playerList.fetch();

		var round = _.find(roundList.models, function(round){ return round.get("number") == ""+number});
		if (round)
            round.destroy();

		round = roundList.create({number: ""+number});

		// Create bye/ringer if needed
		if (playerList.models.length % 2 == 1) {
            var byeRinger = settings.getBye();
            if (byeRinger == settings.AVERAGE_BYE || byeRinger == settings.GG14_BYE)
                playerList.create({name: "Bye", nonCompeting: 'true', bye: 'true'});
            else if (byeRinger == settings.NON_COMPETING_RINGER)
                playerList.create({name: "Ringer", nonCompeting: 'true', ringer: 'true'});
            else if (byeRinger == settings.NON_COMPETING_RINGER)
                playerList.create({name: "Ringer", nonCompeting: 'false', ringer: 'true'});
        }

		// find possible opponents for each player

		var players = playerList.models;
		var possibleMatches = [];

		if (number == 1 || number == "1") {
			_.each(players, function(player) {
				possibleMatches.push({player: player, matches: player.getDissimilarPlayers(players)});
			});
		} else {
			_.each(players, function(player) {
				possibleMatches.push({player: player, matches: player.getBestMatches(players)});
			});
		}

		// assign opponents

		var matchedPlayers = [];
		while (possibleMatches.length > 0) {

			possibleMatches = _.shuffle(possibleMatches);
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getTotalVp()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getVpDiff()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return -match.player.getTotalTp()});
			possibleMatches = _.sortBy(possibleMatches, function(match) {return match.matches.length > 0 ? -match.matches.length : -1000});
			// console.log("matching");
			// console.log(_.reduce(possibleMatches, function(memo, match) { return memo + match.player.getName() + " " + match.matches.length + ", "}, ""));
			var match = possibleMatches.pop();
			
			var player1 = match.player;
			var player2 = match.matches.pop();
			// if no match can be found, just take the next player
			if (!player2) {
				player2 = possibleMatches.pop().player;
				console.log("bad match!");
			}
			// console.log(player1.getName() + " vs " + player2.getName());
			// remove player2 from possibleMatches
			possibleMatches = _.reject(possibleMatches, function(m) {return m.player.id == player2.id});

			// remove player1 and player2 form remaining players matches
			_.each(possibleMatches, function(match) {
				match.matches = _.reject(match.matches, function(m) { 
					return m.id == player1.id || m.id == player2.id; 
				});
				// console.log(_.reduce(match.matches, function(memo, m) { return memo + m.getName() +", "},  match.player.getName() + ": "));
			});



			player1.set("opponent" + number, player2.id);
			player2.set("opponent" + number, player1.id);
			if (player1.isBye())
				setScoresForBye(player1, player2, number, settings.getBye());
			if (player2.isBye())
				setScoresForBye(player2, player1, number, settings.getBye());
			

			var playedTables = player1.getPlayedTables
			matchedPlayers.push({
				player1: player1, 
				player2: player2, 
				playedTables: _.union(player1.getPlayedTables(), player2.getPlayedTables())
			});
		}

		// assign tables
		var tablesNumbers = [];
		var noTables = parseInt(settings.get('tables'));

		for (var i = noTables; i > 0; --i) 
			tablesNumbers.push(i.toString());
	
		while (matchedPlayers.length > 0) {
			// console.log("tables");
			matchedPlayers = _.sortBy(matchedPlayers, function(players) { 
				return players.playedTables.length > 0 ? -players.playedTables.length : -1000
			});
			// console.log(matchedPlayers);
			match = matchedPlayers.pop();
			unplayedTables = _.filter(tablesNumbers, function(number) {return !_.contains(match.playedTables, number)});
			// console.log(match.player1.getName() +", " + match.player2.getName() + ": "+ match.playedTables.toString());
			// console.log(unplayedTables);
			var selectedTable;
			if (match.player1.isBye() || match.player2.isBye()) {
				selectedTable = '-';
			} else {
				if (unplayedTables.length > 0) {
					selectedTable = unplayedTables.pop();
					tablesNumbers = _.without(tablesNumbers, selectedTable);
				} else
					selectedTable = tablesNumbers.pop();

				_.each(matchedPlayers, function(players) {players.playedTables = _.without(players.playedTables, selectedTable)});
			}

			// console.log(selectedTable);
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