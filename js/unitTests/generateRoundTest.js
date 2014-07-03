"use strict";
define([
	'jquery',
  'underscore',
  'backbone',
  'localstorage',
	'../models/roundList',
  '../models/playerList',
  '../models/settings',
  '../logic/generateRound',
  'unitTests/testUtils'
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, GenerateRound, Utils) {
  var run = function() {
    module('GenerateRound', {
      setup: function() {
        this.roundList = new RoundList();
        this.roundList.localStorage = new Backbone.LocalStorage("test-rounds");
        this.roundList.fetch();
        this.playerList = new PlayerList();
        this.playerList.localStorage = new Backbone.LocalStorage("test-players");
        this.playerList.fetch();
        this.settings = new Settings();
        this.settings.localstorage = new Backbone.LocalStorage("test-settings");
        this.settings.fetch();
      },
      teardown: function() {
        while(this.roundList.at(0)) {
          this.roundList.at(0).destroy();
        }
        while(this.playerList.at(0)) {
          this.playerList.at(0).destroy();
        }
        this.settings.destroy();
      }
    });
    test('basics', function() {
      expect(8);
      var players = [];
      for (var i = 0; i < 4; ++i) {
        players[i] = this.playerList.create({name: String.fromCharCode(65 + i)});
      }
      this.settings.set('tables', '2');
      var round = GenerateRound.generate(1, this.playerList, this.roundList, this.settings);

      var playerIds = [];
      var tables = round.getTables(2, this.playerList);
      while (tables.length > 0) {
        var table = tables.pop();
        playerIds.push(table.player1id, table.player2id);
        equal(this.playerList.get(table.player1id).getOpponentForRound(1), table.player2id, 'correct opponent');
        equal(this.playerList.get(table.player2id).getOpponentForRound(1), table.player1id, 'correct opponent');
      }
      while (playerIds.length > 0) {
        var pId = playerIds.pop();
        equal(_.indexOf(playerIds, pId), -1, 'unique player');
      }
    });
    test('5 players and a bye, round 2', function() {
      expect(5);
      this.settings.setTables(2);
      var bye = this.playerList.getByeRinger();
      var players = [];
      for (var i = 0; i < 5; ++i) {
        players[i] = this.playerList.create({name: String.fromCharCode(65 + i)});
      }
      Utils.playGame(1, players[0], players[1], 10, 0, 1);
      Utils.playGame(1, players[2], players[3], 8, 5, 2);
      Utils.playGame(1, players[4], bye, "-", 0, "-");

      var round = GenerateRound.generate(2, this.playerList, this.roundList, this.settings);
      var byeTable = round.getTable('-', this.playerList);

      equal(byeTable.player2.getName(), 'B', 'Lowest scoring player got the Bye');

      var table1 = round.getTable(1, this.playerList);
      var table2 = round.getTable(2, this.playerList);

      ok(table1.player1.getName() === 'E' || table1.player2.getName() === 'E', 'E plays on table 1');
      ok(table1.player1.getName() === 'D' || table1.player2.getName() === 'D', 'D plays on table 1');
      ok(table2.player1.getName() === 'A' || table2.player2.getName() === 'A', 'A plays on table 2');
      ok(table2.player1.getName() === 'C' || table2.player2.getName() === 'C', 'C plays on table 2');
    });

  };
  return {run: run};
});