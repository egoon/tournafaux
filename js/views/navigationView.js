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
/*global define*/
define([
  'underscore',
  'backbone',
  'models/settings',
  'text!../../templates/navigation.tpl'
], function(_, Backbone, Settings, navigationTemplate) {
  "use strict";
  var NavigationView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(options) {
			this.roundList = options.roundList;
			this.roundList.fetch();
      this.playerList = options.playerList;
      this.playerList.fetch();
      this.settings = options.settings;
      this.settings.fetch();
			this.active = options.active;
      this.router = options.router;
      // this.listenTo(this.roundList, 'change', 'render'); //TODO nicer mechanic for redraw
		},

    events: {
      "click #new-tournament": "newTournament",
      "click #roundInfoLink": "openRoundInfoWindow"
    },

		render: function() {
      this.roundList.fetch();
			var rounds = _.sortBy(this.roundList.models, function(round) { return parseInt(round.get('number'), 10);});
      //TODO: use a isStarted method or something
      rounds = _.filter(rounds, function(round) { return round.getTables(3).length > 0;});
			var template = _.template(navigationTemplate, {rounds: rounds, active: this.active});
		    this.$el.html(template);
      if (rounds.length === 0) {
        this.$('#results').hide();
        this.$('#roundInfo').hide();
      }
		  return this;
		},

    newTournament: function() {
      if (confirm("This will remove all settings, players and rounds")) {
        while (this.roundList.length > 0)
          this.roundList.at(0).destroy();
        while (this.playerList.length > 0)
          this.playerList.at(0).destroy();
        this.settings.roundInfoWindow && this.settings.roundInfoWindow.close();
        var country = this.settings.get('countryDataList');
        this.settings.destroy();
        this.settings = new Settings();
        this.settings.set('countryDataList', country);
        if (this.active === 'settings')
          window.location.reload();
        else {
          this.router.navigate('#/');
          //strange bug prevents saving data unless window is reloaded
          window.location.reload();
        }
      }
    },

    openRoundInfoWindow: function() {
      var that = this;
      if (this.settings.roundInfoWindow) {
        this.settings.roundInfoWindow.close();
      }
      this.settings.roundInfoWindow = window.open("#/roundInfo", "_blank", "menubar=0,scrollbars=0,status=0,titlebar=0");
      $(window).unload(function() {
        alert('unload');
        if (that.settings.roundInfoWindow) {
          that.settings.roundInfoWindow.close();
          that.settings.roundInfoWindow = undefined;
        }
      });
      $(window).bind('beforeunload', (function() {return 'This will close the round info window';}));

    }
	});
  return NavigationView;
});