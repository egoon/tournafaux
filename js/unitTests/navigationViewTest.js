"use strict";
define([
	'jquery',
    'underscore',
    'backbone',
    'localstorage',
	'../../js/models/roundList',
	'../../js/views/navigationView',
], function($, _, Backbone, localstorage, RoundList, NavigationView) {
    var run = function() {
    	module("NavigationView", {
			setup: function() {
				this.roundList = new RoundList();
                this.roundList.localStorage = new Backbone.LocalStorage("test-navigationView-rounds");
				this.roundList.fetch();
			},
			teardown: function() {
                while(this.roundList.at(0)) {
                    this.roundList.at(0).destroy();
                }
			},
		});
        test('render', function() {
        	expect(1);
        	var navigationView = new NavigationView({active: "settings", roundList: this.roundList});
			$('#qunit-fixture').html(navigationView.render().el);
            
            notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "settings"');
        });
        test('render several rounds, settings active', function() {
        	expect(5);
        	this.roundList.create({number: '1'});
        	this.roundList.create({number: '2'});
            var navigationView = new NavigationView({active: "settings", roundList: this.roundList});
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
        	var navigationView = new NavigationView({active: "2", roundList: this.roundList});
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
            var navigationView = new NavigationView({active: "settings", roundList: this.roundList});
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