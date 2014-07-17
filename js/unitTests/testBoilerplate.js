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
  'unitTests/testUtils'
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, Utils) {
  var run = function() {
    module("", {
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
    test('', function() {
      expect(1);
      ok(true);
    });
  };
  return {run: run};
});