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
        test('navigationView - render', function() {
        	expect(1);
        	var navigationView = new NavigationView({active: "settings", roundList: this.roundList});
			navigationView.render();
			$('#qunit-fixture').html(navigationView.el);
            
            notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "settings"');
        });
        test('navigationView - render severl rounds', function() {
        	expect(5);
        	this.roundList.create({number: '1'});
        	this.roundList.create({number: '2'});
            var navigationView = new NavigationView({active: "settings", roundList: this.roundList});
			navigationView.render();
			$('#qunit-fixture').html(navigationView.el);
            
            notEqual($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab contains the string "Settings"');
            equal($('#qunit-fixture li.active').html().indexOf("Round 1"), -1, 'the active tab does not contain the string "Round 1"');
            equal($('#qunit-fixture li.active').html().indexOf("Round 2"), -1, 'the active tab does not contain the string "Round 2"');
            notEqual($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is a tab named "Round 1"');
            notEqual($('#qunit-fixture').html().indexOf("Round 2"), -1, 'there is a tab named "Round 2"');
        });
        test('navigationView - render severl rounds', function() {
        	expect(5);
        	this.roundList.create({number: '1'});
        	this.roundList.create({number: '2'});
        	var navigationView = new NavigationView({active: "2", roundList: this.roundList});
			navigationView.render();
			$('#qunit-fixture').html(navigationView.el);
       	 	
       	 	equal($('#qunit-fixture li.active').html().indexOf("Settings"), -1, 'the active tab does not contain the string "Settings"');
            equal($('#qunit-fixture li.active').html().indexOf("Round 1"), -1, 'the active tab does not contain the string "Round 1"');
            notEqual($('#qunit-fixture li.active').html().indexOf("Round 2"), -1, 'the active tab contains the string "Round 2"');
            notEqual($('#qunit-fixture').html().indexOf("Round 1"), -1, 'there is a tab named "Round 1"');
            notEqual($('#qunit-fixture').html().indexOf("Settings"), -1, 'there is a tab named "Settings"');
        });
	};
    return {run: run};
});