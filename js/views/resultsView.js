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
  'views/standingsView',
  'text!../../templates/results.tpl'
], function($, _, Backbone, StandingsView, resultsTemplate) {

  var ResultsView = Backbone.View.extend({

    tagName: 'div',

    initialize: function(options) {
      this.playerList = options.playerList;
      this.playerList.fetch();
      this.roundList = options.roundList;
      this.roundList.fetch();

      this.settings = options.settings;
      this.settings.fetch();
    },

    render: function() {
      var template = _.template(resultsTemplate, {settings: this.settings, players: this.playerList.getCompetingPlayers()});
      this.$el.html(template);
    
      this.$("#standings").html(new StandingsView({playerList: this.playerList}).render().el);
      
      return this;
    },

  });
  
  return ResultsView;
});