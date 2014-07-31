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
"use strict";
define([
	'jquery',
  'underscore',
  'backbone',
  'localstorage',
  '../models/roundList',
  '../models/playerList',
  '../models/settings',
  'unitTests/testUtils',
  '../views/standingsView'
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, Utils, StandingsView) {
  var run = function() {
    module("StandingsView", {
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
    test('render and update', function() {
      expect(9);
      var players = Utils.createPlayers(this.playerList, 6);
      $("#qunit-fixture").html(new StandingsView({playerList: this.playerList}).render().el);
      var rowsSelector = '#qunit-fixture tbody:nth-child(2) tr';
      console.log($(rowsSelector));
      equal($(rowsSelector).length, 6, 'six rows');
      equal($(rowsSelector + ':nth-child(1) td:nth-child(3)').html(), 0, 'no points');

      Utils.playGame(1, players[0], players[1], 9, 5);
      Utils.playGame(1, players[2], players[3], 4, 4);
      Utils.playGame(1, players[4], players[5], 6, 5);

      equal($(rowsSelector + ':nth-child(1) td:nth-child(2)').html(), 'A', 'A in the lead');
      equal($(rowsSelector + ':nth-child(1) td:nth-child(3)').html(), '3', 'A has 3 TP');
      equal($(rowsSelector + ':nth-child(1) td:nth-child(4)').html(), '4', 'A has 4 diff');
      equal($(rowsSelector + ':nth-child(1) td:nth-child(5)').html(), '9', 'A has 9 VP');

      equal($(rowsSelector + ':nth-child(3) td:nth-child(3)').html(), '1', 'C or D has 1 TP');
      equal($(rowsSelector + ':nth-child(3) td:nth-child(4)').html(), '0', 'C or D has 0 diff');
      equal($(rowsSelector + ':nth-child(3) td:nth-child(5)').html(), '4', 'C or D has 4 VP');
    });
  };
  return {run: run};
});