"use strict";
define([
	'jquery',
    'underscore',
    'backbone',
    'localstorage',
	'../models/roundList',
    '../models/playerList',
    '../models/settings',
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings) {
    var run = function() {
    	module("", {
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
        test('', function() {
        	expect(1);
        	

        });
    };
    return {run: run};
});