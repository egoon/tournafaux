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
/*globals define*/
define([
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/playerStatistics.tpl'
], function($, _, Backbone, playerStatisticsTemplate) {
  "use strict";
  var PlayerStatisticsView = Backbone.View.extend({

    tagName: 'div',

    initialize: function(options) {
      this.playerList = options.playerList;
      this.playerList.fetch();

      this.player = options.player;
    },

    render: function() {
      var rounds = [];
      var i, opp, score, diff, oppScore;
      for (i = 1; this.player.getOpponentForRound(i); ++i) {
        opp = this.playerList.get(this.player.getOpponentForRound(i));
        score = this.player.getVpForRound(i);
        diff = this.player.getVpDiffForRound(i);
        oppScore = score - diff;
        rounds.push({
          number: i,
          opponent: opp.getName(),
          tp: this.player.getTpForRound(i),
          score: score + " - " + oppScore,
          diff: diff
        });
      }
      var template = _.template(playerStatisticsTemplate, {player: this.player, rounds: rounds});
      this.$el.html(template);
      return this;
    }

  });
  
  return PlayerStatisticsView;
});