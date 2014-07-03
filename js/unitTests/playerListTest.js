"use strict";
define([
  'underscore',
  'backbone',
  'localstorage',
  'unitTests/testUtils',
	'../../js/models/playerList'
], function(_, Backbone, localstorage, Utils, PlayerList) {
  var run = function() {
    module("PlayerList tests - one player", {
      setup: function() {
				this.playerList = new PlayerList();
        this.playerList.localStorage = new Backbone.LocalStorage("test-player-players");
				this.playerList.fetch();
        this.player = this.playerList.create({name: "tester"});
        this.player.setCity('testCity');
        this.player.setFaction('gremlins');
			},
			teardown: function() {
        while(this.playerList.at(0)) {
          this.playerList.at(0).destroy();
        }
			}
		});
        test('clearGames', function() {
            expect(10);
            this.player.setVpForRound(1, '3');
            this.player.setVpForRound(2, '4');
            this.player.setVpForRound(3, '5');
            this.player.clearGames(1);

            ok(!this.player.getVpForRound(1), "vp1 should be unset");
            equal(this.player.getVpForRound(2), '4', 'vp2 should be unchanged');

            this.player.setOpponentForRound(1, 'x');
            this.player.setOpponentForRound(2, 'y');
            this.player.setTableForRound(1, '2');
            this.player.clearGames(3);

            ok(!this.player.get('opponent1'), "opponent1 should be unset");
            ok(!this.player.get('opponent2'), "opponent2 should be unset");
            ok(!this.player.get('table1'), "table1 should be unset");
            ok(!this.player.get('vp2'), "vp2 should be unset");
            ok(!this.player.get('vp3'), "vp3 should be unset");

            equal(this.player.getName(), 'tester', 'name should be unchanged');
            equal(this.player.getCity(), 'testCity', 'city should be unchanged');
            equal(this.player.getFaction(), 'gremlins', 'faction should be unchanged');
        });
        test('getPreviousOpponents', function() {
            expect(2);
            this.player.set('opponent1', 'x');
            this.player.set('opponent2', 'y');
            this.player.set('opponent3', 'z');

            deepEqual(this.player.getPreviousOpponents(3), ['x', 'y', 'z'], 'should fetch all three oppoonents');

            this.player.unset('opponent2');

            deepEqual(this.player.getPreviousOpponents(3), ['x'], 'should fetch one oppoonent');
        });
        test('getPlayedTables', function() {
            expect(2);
            var player = this.playerList.at(0);
            player.set('table1', '1');
            player.set('table2', '2');
            player.set('table3', '3');

            deepEqual(player.getPlayedTables(), ['1', '2', '3'], 'should fetch all three tables');

            player.unset('table2');

            deepEqual(player.getPlayedTables(), ['1'], 'should fetch one table');
        });
        test('countPointsWithBye', function() {
            var player = this.playerList.at(0);
            expect(12);
            player.setVpTpAndDiffForRound(1, '-','-','-');

            equal(player.getTotalVp(), 0, 'score 0 vp for first bye');
            equal(player.getTotalTp(), 1, 'score 1 tp for first bye');
            equal(player.getVpDiff(), 0, 'score 0 diff for first bye');

            player.setVpTpAndDiffForRound(2, '5','3','1');

            equal(player.getTotalVp(), 10, 'score 5 vp for first bye');
            equal(player.getTotalTp(), 6, 'score 3 tp for first bye');
            equal(player.getVpDiff(), 2, 'score 1 diff for first bye');

            player.setVpTpAndDiffForRound(3, '3','0','-3');

            equal(player.getTotalVp(), 12, 'score 4 vp for first bye');
            equal(player.getTotalTp(), 4.5, 'score 1.5 tp for first bye');
            equal(player.getVpDiff(), -3, 'score -1 diff for first bye');

            player.setVpTpAndDiffForRound(1, '7','3','1');

            equal(player.getTotalVp(), 15, '5+3+7');
            equal(player.getTotalTp(), 6, '3+3+0');
            equal(player.getVpDiff(), -1, '1-3+1');
        });
        test('bye and ringer', function() {
          expect(15);
          var bye = this.playerList.getByeRinger();

          ok(bye.isBye(), 'The Bye is a Bye');
          ok(!bye.isRinger(), 'The Bye is not a Ringer');
          ok(bye.isNonCompeting(), 'The Bye is non competing');
          equal(bye.getName(), 'Bye', 'Bye Name');

          bye.setName('Bennie');

          equal(bye.getName(), 'Bye', 'Bye Name unchanged');

          bye.setRinger(true);

          ok(!bye.isBye(), 'The Ringer is not a Bye');
          ok(bye.isRinger(), 'The Ringer is a Ringer');
          equal(bye.getName(), 'Bennie (Ringer)', 'Bennie is a Ringer');

          bye.setName('');

          equal(bye.getName(), 'Ringer', 'Ringer by name');

          bye.setBye(true);

          ok(bye.isBye(), 'The Bye is a Bye');
          ok(!bye.isRinger(), 'The Bye is not a Ringer');

          bye.setRinger(true);
          bye.setCity('Stockholm');
          bye.setFaction('Gremlins');

          equal(bye.getCity(), '', 'No city for non competing');
          equal(bye.getFaction(), '', 'No faction for non competing');

          bye.setNonCompeting(false);

          equal(bye.getCity(), 'Stockholm', 'Competing ringer city');
          equal(bye.getFaction(), 'Gremlins', 'Competing ringer faction');
        });

        module("PlayerList tests - multiple players", {
            setup: function() {
                this.playerList = new PlayerList();
                this.playerList.localStorage = new Backbone.LocalStorage("test-playerlist-players");
                this.playerList.fetch();
                while(this.playerList.at(0)) {
                    this.playerList.at(0).destroy();
                }
            },
            teardown: function() {
                while(this.playerList.at(0)) {
                    this.playerList.at(0).destroy();
                }
            }
        });
        test('getDissimilarPlayers - simple setup', function() {
            expect(4);
            var player;
            for (var i = 1; i <= 4; ++i) {
                player = this.playerList.create({name: 'player' + i});
            }
            
            equal(player.getDissimilarPlayers(this.playerList.models).length, 3, 'all players are dissimilar');
            _.each(player.getDissimilarPlayers(this.playerList.models), function(other) {
                notEqual(other.getName(), player.getName(), 'the player should not be in her own list');
            });
        });
        test('getDissimilarPlayers - complex setup', function() {
            expect(5);
            var player = this.playerList.create({name: 'rezSthlm', city: 'Sthlm', faction: 'rez'});
            this.playerList.create({name: 'outSthlm', city: 'Sthlm', faction: 'out'});
            this.playerList.create({name: 'rezGbg', city: 'Gbg', faction: 'rez'});
            this.playerList.create({name: 'outGbg', city: 'Gbg', faction: 'out'});
            
            var models = this.playerList.models;
            _.each(models, function(p) {
                equal(player.getDissimilarPlayers(models).length, 1, p.getName() + ' only has one dissimilar player');
            });
            equal(player.getDissimilarPlayers(models).pop().getName(), 'outGbg', 'rezSthlm should be unlike outGbg only');
        });

        test('getBestMatches - A vs B: 6-4, C vs D: 9-1, E vs F: 7-3', function() {
            expect(8);
            var players = [];
            for (var i = 0; i < 6; ++i) {
                players[i] = this.playerList.create({name: String.fromCharCode(65 + i)});
            }
            Utils.playGame(1, players[0], players[1], 6, 4);
            Utils.playGame(1, players[2], players[3], 9, 1);
            Utils.playGame(1, players[4], players[5], 7, 3);

            for (var i = 0; i < 6; ++i) {
                var bestMatches = players[i].getBestMatches(players, 3);
                equal(bestMatches.length, 4, 'player ' + players[i].getName() + ' should have four possible matches');
            }

            deepEqual(
                _.map(players[0].getBestMatches(players, 3), function(p) {return p.getName()}),
                ['D', 'F', 'C', 'E'], 'preferred opponents for player A');

            deepEqual(
                _.map(players[5].getBestMatches(players, 3), function(p) {return p.getName()}),
                ['C', 'A', 'D', 'B'], 'preferred opponents for player F');
        });
    };
    return {run: run};
});