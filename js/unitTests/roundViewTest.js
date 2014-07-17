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
  '../views/roundView',
  'unitTests/testUtils'
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, RoundView, Utils) {
  var run = function() {
    module("RoundView", {
			setup: function() {
				this.roundList = new RoundList();
        this.roundList.localStorage = new Backbone.LocalStorage("test-roundView-rounds");
				this.roundList.fetch();
        this.playerList = new PlayerList();
        this.playerList.localStorage = new Backbone.LocalStorage("test-roundView-players");
        this.playerList.fetch();
        this.settings = new Settings();
        this.settings.localstorage = new Backbone.LocalStorage("test-roundView-settings");
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
    test('first round - 6 players', function() {
      expect(4);
      Utils.createPlayers(this.playerList, 6);
      this.settings.setTables(3);
      var round = Utils.createSimpleFirstRound(this.playerList, this.roundList);
      var roundView = new RoundView({playerList: this.playerList, roundList: this.roundList, settings: this.settings, router: {}});
      roundView.setRoundNumber(1).render();

      $('#qunit-fixture').html(roundView.el);
      var selectorRow1 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(1) ';
      var selectorRow2 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(2) ';
      var selectorRow3 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(3) ';

      equal($(selectorRow1 + 'td:nth-child(1)').html(), '1', 'first table name is "1"');
      equal($(selectorRow1 + 'td:nth-child(2)').html(), 'A', 'table 1 player 1 is A');
      equal($(selectorRow2 + 'td:nth-child(5)').html(), 'D', 'table 2 player 2 is D');
      equal($(selectorRow3 + 'td:nth-child(3) input').attr('id'), this.playerList.findWhere({name : 'E'}).id, 'input has same id as player E');


    });
  };
  return {run: run};
});