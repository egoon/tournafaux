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
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/roundInfo.tpl'
], function($, _, Backbone, roundViewTemplate) {
  "use strict";

  var RoundInfoView = Backbone.View.extend({

    tagName: 'div',

    initialize: function(options) {
      var that = this;
      this.roundList = options.roundList;
      this.settings = options.settings;
      this.playerList = options.playerList;
      console.log('init');
      window.opener.$('#changeRoundTriggerElement').change(function() {console.log('test');});
      window.opener.$('#changeRoundTriggerElement').change(function() {that.render();});
    },

    render: function() {
      this.roundList.fetch();
      this.playerList.fetch();
      this.settings.fetch();
      console.log(this.playerList);
      console.log('render');
      this.changeRound();
      console.log(this.round);
      var tables = this.round.getTables(this.settings.getTables(), this.playerList);
      console.log(tables);
      var template = _.template(roundViewTemplate, {
        round: this.round,
        tables: tables
      });
      this.$el.html(template);
      console.log(this.round.getTables(this.settings.getTables(), this.playerList));
      return this;
    },

    changeRound: function() {

      this.roundList.fetch();

      var rounds = _.sortBy(this.roundList.models, function(round) { return parseInt(round.getNumber(), 10);});

      //TODO: use a isStarted method or something
      rounds = _.filter(rounds, function(round) { return round.getTables(3).length > 0;});

      if (rounds.length > 0) {
        this.round = rounds[rounds.length - 1];
      } else {
        this.round = this.roundList.at(0);
      }

    }

  });

  return RoundInfoView;
});