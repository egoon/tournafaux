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
      expect(17);
      Utils.createPlayers(this.playerList, 6);
      this.settings.setTables(3);
      var round = Utils.createSimpleFirstRound(this.playerList, this.roundList);
      var roundView = new RoundView({playerList: this.playerList, roundList: this.roundList, settings: this.settings, router: {}, active: '1'});
      roundView.render();
      $('#qunit-fixture').html(roundView.el);
      
      var selectorRow1 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(1) ';
      var selectorRow2 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(2) ';
      var selectorRow3 = '#qunit-fixture tbody:nth-child(2) tr:nth-child(3) ';

      equal($(selectorRow1 + 'td:nth-child(1)').html(), '1', 'first table name is "1"');
      equal($(selectorRow1 + 'td:nth-child(2)').html(), 'A', 'table 1 player 1 is A');
      equal($(selectorRow2 + 'td:nth-child(5)').html(), 'D', 'table 2 player 2 is D');
      equal($(selectorRow3 + 'td:nth-child(3) input').attr('id'), this.playerList.findWhere({name : 'E'}).id, 'input has same id as player E');

      var playerB = this.playerList.findWhere({name : 'B'});
      var playerA = this.playerList.findWhere({name : 'A'});

      $(selectorRow1 + 'td:nth-child(4) input').val('3');
      $('#'+playerB.id).trigger(jQuery.Event('change'));

      equal(playerB.getVpForRound(1), 3, 'set VP for B');

      equal(playerB.getTpForRound(1), 0, 'TP still unset for B');

      $(selectorRow1 + 'td:nth-child(3) input').val('5');
      $('#'+playerA.id).trigger(jQuery.Event('change'));

      equal(playerA.getVpForRound(1), 5, 'set VP for A');
      equal(playerA.getTpForRound(1), 3, 'TP 3 for A');
      equal(playerB.getTpForRound(1), 0, 'TP 0 for B');
      equal(playerA.getVpDiffForRound(1), 2, 'A at 2 diff');
      equal(playerB.getVpDiffForRound(1), -2, 'B at -2 diff');

      $(selectorRow1 + 'td:nth-child(4) input').val('9');
      $('#'+playerB.id).trigger(jQuery.Event('change'));

      equal(playerA.getVpForRound(1), 5, 'VP for A');
      equal(playerB.getVpForRound(1), 9, 'VP for B');
      equal(playerA.getTpForRound(1), 0, 'TP 0 for A');
      equal(playerB.getTpForRound(1), 3, 'TP 3 for B');
      equal(playerA.getVpDiffForRound(1), -4, 'A at -4 diff');
      equal(playerB.getVpDiffForRound(1), 4, 'B at 4 diff');
    });
    test('first round - 5 players and bye', function() {
      expect(3);
      var bye = this.playerList.getByeRinger();
      bye.setBye(true);
      bye.setActive(true);
      this.settings.setTables(2);
      Utils.createPlayers(this.playerList, 5);
      var round = Utils.createSimpleFirstRound(this.playerList, this.roundList);
      var roundView = new RoundView({playerList: this.playerList, roundList: this.roundList, settings: this.settings, router: {}, active: '1'});
      roundView.render();
      $('#qunit-fixture').html(roundView.el);

      var playerA = this.playerList.findWhere({name : 'A'});

      ok(isNaN(playerA.getVpForRound(1)), 'no VP for A');
      equal($('#'+playerA.id).attr('disabled'), 'disabled', 'A VP box disabled');
      equal($('#'+bye.id).attr('disabled'), 'disabled', 'Bye VP box disabled');
    });
    // test('disqualifications', function() {
    //   expect(3);
    //   Utils.createPlayers(this.playerList, 6);
    //   this.settings.setTables(3);
    //   var round = Utils.createSimpleFirstRound(this.playerList, this.roundList);
    //   var roundView = new RoundView({playerList: this.playerList, roundList: this.roundList, settings: this.settings, router: {}, active: '1'});
    //   roundView.render();
    //   $('#qunit-fixture').html(roundView.el);

    //   var playerC = this.playerList.findWhere({name : 'C'});

    //   ok(playerC.isActive(), 'player C is active');

    //   //TODO needs mock confirm
    //   $('#qunit-fixture #disqualify-select').val(playerC.id);
    //   $('#qunit-fixture #disqualify-button').click();

    //   ok(!playerC.isActive(), 'player C is inactive');
    //   console.log(this.playerList.getActivePlayers());
    //   console.log(_.findWhere(this.playerList.getActivePlayers(), {id: playerC.id}));
    //   ok(!_.findWhere(this.playerList.getActivePlayers(), {id: playerC.id}));
    // });
    test('standings view renders', function() {
      expect(1);
      Utils.createPlayers(this.playerList, 6);
      this.settings.setTables(3);
      var round = Utils.createSimpleFirstRound(this.playerList, this.roundList);
      var roundView = new RoundView({playerList: this.playerList, roundList: this.roundList, settings: this.settings, router: {}, active: '1'});
      roundView.render();
      $('#qunit-fixture').html(roundView.el);

      equal($('#qunit-fixture #standings tbody:nth-child(2) tr').length, 6, 'six rows in standings view');
    });
  };
  return {run: run};
});