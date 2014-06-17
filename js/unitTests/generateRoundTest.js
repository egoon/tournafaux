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
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, GenerateRound) {
    var run = function() {
    	module('GenerateRound', {
			setup: function() {
				this.roundList = new RoundList();
                this.roundList.localStorage = new Backbone.LocalStorage("test-rounds");
				this.roundList.fetch();
                this.playerList = new PlayerList();
                this.playerList.localStorage = new Backbone.LocalStorage("test-players");
                this.playerList.fetch();
                this.settings = new Settings({id: 'settings', rounds: '3'});
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
			},
		});
        test('basics', function() {
        	expect(8);
        	var players = [];
            for (var i = 0; i < 4; ++i) {
                players[i] = this.playerList.create({name: String.fromCharCode(65 + i)});
            }
            var round = GenerateRound.generate(1, this.playerList, this.roundList);

            var playerIds = [];
            var tables = round.getTables();
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
    };
    return {run: run};
});