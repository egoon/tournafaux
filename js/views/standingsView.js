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
define([
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/standings.tpl',
], function($, _, Backbone, standingsTemplate) {
  	var StandingsView = Backbone.View.extend({

		el: '.standings',

		initialize: function(options) {
			this.playerList = options.playerList;
			this.listenTo(this.playerList, 'change', this.render);

		},

		events: {
			"click #helpBye": "showHelpBye",
		},

		render: function() {
			var players = this.playerList.getCompetingPlayers();
			players = _.reject(players, function(p) {return p.isNonCompeting()});
			players = _.sortBy(players, function(p) {return p.getTotalVp()});
			players = _.sortBy(players, function(p) {return p.getVpDiff()});
			players = _.sortBy(players, function(p) {return p.getTotalTp()});
			players = players.reverse();

			var template = _.template(standingsTemplate, {players: players});
		    this.$el.html(template);
		},

		showHelpBye: function(e) {
			showHelpBye();
		},
	});
  	return StandingsView;
});