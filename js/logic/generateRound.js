define([
  'underscore',
], function(_) {
	var BYE_ID = "0";
	var BYE_SCORE = "-";

	var setScoresForBye = function(bye, opp, number) {
		bye.setVpForRound(number, "0");
		bye.setVpDiffForRound(number, "0");
		bye.setTpForRound(number, "0");
		opp.setVpForRound(number, BYE_SCORE);
		opp.setVpDiffForRound(number, BYE_SCORE);
		opp.setTpForRound(number, BYE_SCORE);
	};

  	var generateRound = function(number, playerList, roundList) {

		roundList.fetch();
		playerList.fetch();

		var round = _.find(roundList.models, function(round){ return round.get("number") == ""+number});
		
		if (!round) {
			round = roundList.create({number: ""+number});
		} else {
			_.each(playerList.models, function(p) {p.unset("opponent"+number)});
		}

		// Create bye if needed
		if (playerList.models.length % 2 == 1)
			playerList.create({id:BYE_ID, name:"-"});

		var players = playerList.models;
		var matches = [];

		if (number == 1 || number == "1") {
			_.each(players, function(player) {
				matches.push({player: player, matches: player.getDissimilarPlayers(players)});
			});
		} else {
			_.each(players, function(player) {
				matches.push({player: player, matches: player.getBestMatches(players)});
			});
		}

		var table = 1;
		while (matches.length > 0) {

			matches = _.shuffle(matches);
			matches = _.sortBy(matches, function(match) {return match.player.getTotalVp()});
			matches = _.sortBy(matches, function(match) {return match.player.getVpDiff()});
			matches = _.sortBy(matches, function(match) {return match.player.getTotalTp()});
			matches = _.sortBy(matches, function(match) {return -match.matches.length});

			var match = matches.pop();
			var player1 = match.player;
			var player2 = match.matches.pop();
			// if no match can be found, just take the next player
			if (!player2) 
				player2 = matches.pop().player;


			matches = _.reject(matches, function(m) {return m.player.id == player2.id});
			_.each(matches, function(match) {
				match.matches = _.reject(match.matches, function(m) { 
					return m.id == player1.id || m.id == player2.id; 
				});
			});

			player1.set("opponent" + number, player2.id);
			player2.set("opponent" + number, player1.id);
			if (player1.id == BYE_ID)
				setScoresForBye(player1, player2, number);
			if (player2.id == BYE_ID)
				setScoresForBye(player2, player1, number);
			player1.save();
			player2.save();
			round.set("table"+table+"player1", player1.id);
			round.set("table"+table+"player2", player2.id);

			round.save();
			table ++;
		}

	};
  	return {generate: generateRound};
});