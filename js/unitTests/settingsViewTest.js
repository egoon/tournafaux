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
	'../views/settingsView'
], function($, _, Backbone, localstorage, RoundList, PlayerList, Settings, SettingsView) {
    var run = function() {
    	module("SettingsView", {
			setup: function() {
				this.roundList = new RoundList();
                this.roundList.localStorage = new Backbone.LocalStorage("test-settingsView-rounds");
				this.roundList.fetch();
                this.playerList = new PlayerList();
                this.playerList.localStorage = new Backbone.LocalStorage("test-settingsView-players");
                this.playerList.fetch();
                this.settings = new Settings();
                this.settings.localstorage = new Backbone.LocalStorage("test-settingsView-settings");
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
        test('render empty', function() {
        	expect(4);
        	var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
			$('#qunit-fixture').html(settingsView.render().el);
            
            equal($('#qunit-fixture #rounds').val(), "3", 'default rounds');
            ok(! $('#qunit-fixture #player-table #name').html(), 'no player rows');
            ok($('#qunit-fixture #player-table #new-player'), 'new player input');
            notEqual($('#qunit-fixture #validation-errors').html(), '', 'there are validation errors');

        });
        test('edit settings', function() {
            expect(2);
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);

            $('#qunit-fixture #rounds').val('5');

            equal(this.settings.get('rounds'), '3', 'settings.rounds unchanged');

            $('#qunit-fixture #rounds').trigger(jQuery.Event('change'));

            equal(this.settings.get('rounds'), '5', 'settings.rounds changed');
        });

        var addPlayer = function(name) {
            $('#qunit-fixture #player-table #new-player').val(name);
            $('#qunit-fixture #player-table #new-player').trigger(jQuery.Event('keypress', {keyCode: 13}));
        };
        var getPlayer = function(playerList, name) {
            return playerList.findWhere({name: name});
        };
        

        test('add players', function() {
            expect(3);
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);
            
            ok(! $('#qunit-fixture #player-table #name').html(), 'no player rows');

            addPlayer('Egoon');

            equal($('#qunit-fixture #player-table #name:visible').val(), 'Egoon', 'player added through form');

            addPlayer('Tester');
            var player = getPlayer(this.playerList, 'Tester');

            equal($('#qunit-fixture #player-table #' + player.id + ' #name').val(), 'Tester', 'player added behind the scenes');
        });
        test('render with players', function() {
            expect(15);
            var players = [];
            for (var i = 0; i < 4; ++i) {
                players[i] = this.playerList.create({
                    name: String.fromCharCode(65 + i), 
                    city: String.fromCharCode(65 + i) + ' City', 
                    faction: 'Faction ' + String.fromCharCode(65 + i)
                });
            }
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);

            for (var i = 0; i < 4; ++i) {
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #name').val(), players[i].getName(), players[i].getName() + ' rendered');
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #city').val(), players[i].getCity(), players[i].getCity() + ' rendered');
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #faction').val(), players[i].getFaction(), players[i].getFaction() + ' rendered');
            }

            addPlayer('Tester');
            var player = getPlayer(this.playerList, 'Tester');

            equal($('#qunit-fixture #player-table #' + player.id + ' #name').val(), 'Tester', 'player added');
            equal($('#qunit-fixture #player-table #' + players[0].id + ' #name').val(), 'A', 'A still rendered');
            equal($('#qunit-fixture #player-table #' + players[3].id + ' #name').val(), 'D', 'D still rendered');
        });

        var editPlayer = function(id, property, value) {
            $('#qunit-fixture #player-table #' + id + ' #' + property).val(value);
            $('#qunit-fixture #player-table #' + id + ' #' + property).trigger(jQuery.Event('change'));
        };

        test('edit players', function() {
            expect(8);
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);

            addPlayer('Egoon');
            var egoon = getPlayer(this.playerList, 'Egoon');
            addPlayer('Tester');
            var tester = getPlayer(this.playerList, 'Tester');

            equal($('#qunit-fixture #player-table #' + egoon.id + ' #city').val(), '', 'Egoon\'s city clear');
            equal($('#qunit-fixture #player-table #' + tester.id + ' #faction').val(), '', 'Tester\'s faction clear');

            editPlayer(egoon.id, 'name', 'Bennie');
            editPlayer(egoon.id, 'city', 'Stockholm');
            editPlayer(tester.id, 'faction', 'Gremlins');

            equal(egoon.getName(), 'Bennie', 'Egoon changed name to Bennie');
            equal(egoon.getCity(), 'Stockholm', 'Bennie\'s city is Stockholm');
            equal(egoon.getFaction(), '', 'Bennie\'s faction is empty');

            equal(tester.getName(), 'Tester', 'Tester did not change name');
            equal(tester.getCity(), '', 'Tester\'s city is empty');
            equal(tester.getFaction(), 'Gremlins', 'Tester\'s faction is Gremlins');

        });
        test('toggle generate button', function() {
            expect(4);
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);
            
            ok(! $('#qunit-fixture #player-table #name').html(), 'no player rows');

            addPlayer('A');
            addPlayer('B');

            notEqual($('#qunit-fixture #validation-errors').html(), '', 'there are validation errors');

            addPlayer('C');

            equal($('#qunit-fixture #validation-errors').html(), '', 'there are no validation errors');

            this.settings.set('rounds', '4');

            notEqual($('#qunit-fixture #validation-errors').html(), '', 'there are validation errors');
        });
    };
    return {run: run};
});