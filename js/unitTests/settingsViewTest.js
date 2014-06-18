"use strict";
define([
	'jquery',
    'underscore',
    'backbone',
    'localstorage',
	'../models/roundList',
    '../models/playerList',
    '../models/settings',
	'../views/settingsView',
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
			},
		});
        test('render empty', function() {
        	expect(4);
        	var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
			$('#qunit-fixture').html(settingsView.render().el);
            
            equal($('#qunit-fixture #rounds').val(), "3", 'default rounds');
            ok(! $('#qunit-fixture #player-table #name').html(), 'no player rows');
            ok($('#qunit-fixture #player-table #new-player'), 'new player input');
            ok($('#qunit-fixture #generate-round.btn-danger').html(), 'generate round button has danger css');

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

            equal($('#qunit-fixture #player-table #name').val(), 'Egoon', 'player added through form');

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
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #name').val(), players[i].get('name'), players[i].get('name') + ' rendered');
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #city').val(), players[i].get('city'), players[i].get('city') + ' rendered');
                equal($('#qunit-fixture #player-table #' + players[i].id + ' #faction').val(), players[i].get('faction'), players[i].get('faction') + ' rendered');
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

            equal(egoon.get('name'), 'Bennie', 'Egoon changed name to Bennie');
            equal(egoon.get('city'), 'Stockholm', 'Bennie\'s city is Stockholm');
            equal(egoon.get('faction'), '', 'Bennie\'s faction is empty');

            equal(tester.get('name'), 'Tester', 'Tester did not change name');
            equal(tester.get('city'), '', 'Tester\'s city is empty');
            equal(tester.get('faction'), 'Gremlins', 'Tester\'s faction is Gremlins');

        });
        test('toggle generate button', function() {
            expect(4);
            var settingsView = new SettingsView({playerList: this.playerList, roundList: this.roundList, settings: this.settings});
            $('#qunit-fixture').html(settingsView.render().el);
            
            ok(! $('#qunit-fixture #player-table #name').html(), 'no player rows');

            addPlayer('A');
            addPlayer('B');
            addPlayer('C');

            ok($('#qunit-fixture #generate-round.btn-danger').html(), 'generate round button has danger css');

            addPlayer('D');

            ok($('#qunit-fixture #generate-round.btn-primary').html(), 'generate round har primary css');

            this.settings.set('rounds', '4');

            ok($('#qunit-fixture #generate-round.btn-danger').html(), 'generate round button has danger css');
        });
    };
    return {run: run};
});