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
  'logic/helpTexts',
  'text!../../templates/standings.tpl',
], function($, _, Backbone, HelpTexts, standingsTemplate) {
  var StandingsView = Backbone.View.extend({

    tagName: 'div',

    initialize: function(options) {
      this.playerList = options.playerList;
      this.listenTo(this.playerList, 'change', this.render);
    },

    events: {
      "click #helpBye": "showHelpBye"
    },

    render: function() {
      var players = this.playerList.getCompetingPlayers();

      var template = _.template(standingsTemplate, {players: players});
      this.$el.html(template);
      return this;
    },

    textTable: function() {
      var players = this.playerList.getCompetingPlayers()


      var nameCol = _.reduce(players, function(maxlen, p) {return Math.max(p.getName().length, maxlen)}, "players".length);
      var tpCol = _.reduce(players, function(maxlen, p) {return Math.max(p.getTotalTp().toString().length, maxlen)}, "tp".length);
      var diffCol = _.reduce(players, function(maxlen, p) {return Math.max(p.getVpDiff().toString().length, maxlen)}, "diff".length);
      var vpCol = _.reduce(players, function(maxlen, p) {return Math.max(p.getTotalVp().toString().length, maxlen)}, "vp".length);

      var header = 
        "Players" + new Array(nameCol - "players".length + 2 + tpCol - "tp".length).join(" ") +
        "TP" + new Array(diffCol - "diff".length + 2).join(" ") +
        "Diff" + new Array(vpCol - "vp".length + 2).join(" ") +
        "VP" + "%0D%0A";

      var table = "";

      _.each(players, function(p) {
        table +=
        p.getName() + new Array(nameCol - p.getName().length + 2 + tpCol - p.getTotalTp().toString().length).join(" ") +
        p.getTotalTp() + new Array(diffCol - p.getVpDiff().toString().length + 2).join(" ") +
        p.getVpDiff() + new Array(vpCol - p.getTotalVp().toString().length + 2).join(" ") +
        p.getTotalVp() + "%0D%0A";
      });

      return header + table;
    },

    showHelpBye: function() {
      HelpTexts.showHelpText("bye,average-bye,gg14-bye");
    }
  });
  return StandingsView;
});