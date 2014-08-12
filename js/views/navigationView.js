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
  'underscore',
  'backbone',
  'text!../../templates/navigation.tpl',
], function(_, Backbone, navigationTemplate) {
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
			
			this.listenTo(this.roundList, 'remove', this.render);
			this.listenTo(this.roundList, 'reset', this.render);
			this.listenTo(this.roundList, 'add', this.render);
		},

    events: {
      "click #new-tournament": "newTournament"
    },

		render: function() {
			var rounds = _.sortBy(this.roundList.models, function(round) { return parseInt(round.get('number'));});
			var template = _.template(navigationTemplate, {rounds: rounds, active: this.active});
		    this.$el.html(template);
		    return this;
		},

    newTournament: function() {
      if (confirm("This will remove all settings, players and rounds")) {
        while (this.roundList.length > 0)
          this.roundList.at(0).destroy();
        while (this.playerList.length > 0)
          this.playerList.at(0).destroy();
        this.settings.destroy();
        if (this.active === 'settings')
          window.location.reload();
        else {
          this.router.navigate('#/');
        }
      }
    }
	});
  	return NavigationView;
});