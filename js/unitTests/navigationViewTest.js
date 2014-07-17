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
	'../../js/views/navigationView',
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, NavigationView) {
  var run = function() {
    module("NavigationView", {
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
    test('render', function() {
      expect(1);
      var navigationView = new NavigationView({active: "settings", roundList: this.roundList, playerList: this.playerList, settings: this.settings});
      $('#qunit-fixture').html(navigationView.render().el);

      notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "settings"');
    });
    test('render several rounds, settings active', function() {
      expect(5);
      this.roundList.create({number: '1'});
      this.roundList.create({number: '2'});
      var navigationView = new NavigationView({active: "settings", roundList: this.roundList, playerList: this.playerList, settings: this.settings});
      $('#qunit-fixture').html(navigationView.render().el);

      notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "Settings"');
      equal($('#qunit-fixture li.active').html().indexOf("Round 1"), -1, 'the active tab does not contain the string "Round 1"');
      equal($('#qunit-fixture li.active').html().indexOf("Round 2"), -1, 'the active tab does not contain the string "Round 2"');
      notEqual($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is a tab named "Round 1"');
      notEqual($('#qunit-fixture').html().indexOf("Round 2"), -1, 'there is a tab named "Round 2"');
    });
    test('render several rounds, round 2 active', function() {
      expect(5);
      this.roundList.create({number: '1'});
      this.roundList.create({number: '2'});
      var navigationView = new NavigationView({active: "2", roundList: this.roundList, playerList: this.playerList, settings: this.settings});
      $('#qunit-fixture').html(navigationView.render().el);

      equal($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab does not contain the string "Settings"');
      equal($('#qunit-fixture li.active').html().indexOf("Round 1"), -1, 'the active tab does not contain the string "Round 1"');
      notEqual($('#qunit-fixture li.active').html().indexOf("Round 2"), -1, 'the active tab contains the string "Round 2"');
      notEqual($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is a tab named "Round 1"');
      notEqual($('#qunit-fixture').html().indexOf("Settings"), -1, 'there is a tab named "Settings"');
    });
    test('removing rounds', function() {
      expect(6);
      var round1 = this.roundList.create({number: '1'});
      var round2 = this.roundList.create({number: '2'});
      var navigationView = new NavigationView({active: "settings", roundList: this.roundList, playerList: this.playerList, settings: this.settings});
      $('#qunit-fixture').html(navigationView.render().el);

      notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "Settings"');
      notEqual($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is a tab named "Round 1"');
      notEqual($('#qunit-fixture').html().indexOf("Round 2"), -1, 'there is a tab named "Round 2"');

      round1.destroy();
      round2.destroy();

      notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab is still "Settings"');
      equal($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is no tab named "Round 1"');
      equal($('#qunit-fixture').html().indexOf("Round 2"), -1, 'there is no tab named "Round 2"');
    });
	};
  return {run: run};
});