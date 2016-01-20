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
  'text!../../templates/roundSettings.tpl',
  'logic/malifaux'
], function($, _, Backbone, roundSettingsTemplate, Malifaux) {
  "use strict";
  var RoundSettingsView = Backbone.View.extend({
    tagName: 'div',

    events: {
      "change select.deploy-select": "onDeploySelect",
      "change select.scheme-select": "onSchemeSelect",
      "change select.strategy-select": "onStrategySelect",
      "click a.remove-scheme": "removeScheme",
      "click a.randomize": "randomizeSchemes",
      "click a.randomize-gg16": "randomizeGG16Schemes"
    },

    initialize: function(options) {
      this.round = options.round;
      this.listenTo(this.round, 'change', this.render);
    },

    render: function() {
      var that = this;
      var template = _.template(roundSettingsTemplate, {round: this.round});
      this.$el.html(template);

      _.each(
        Malifaux.getAvailableDeployments(),
        function(deployment) { that.$('select.deploy-select').append('<option>' + deployment + '</option>');}
      );
      if (this.round.getDeployment()) {
        this.$('select.deploy-select').val(this.round.getDeployment());
      } else {
        this.$('select.deploy-select').prepend('<option selected>[Deployment]</option>');
      }

      _.each(
        Malifaux.getAvailableStandardStrategies(),
        function(strategy) { that.$('select.strategy-select').append('<option>' + strategy + '</option>');}
      );
      _.each(
        Malifaux.getAvailableGG15Strategies(),
        function(strategy) { that.$('select.strategy-select').append('<option>' + strategy + '</option>');}
      );
      if (this.round.getStrategy()) {
        this.$('select.strategy-select').val(this.round.getStrategy());
      } else {
        this.$('select.strategy-select').prepend('<option selected>[Strategy]</option>');
      }

      var schemes =  this.round.getSchemes();
      _.each(
        _.reject(Malifaux.getAvailableSchemes(), function(s) { return _.contains(schemes, s); }),
        function(scheme) { that.$('select.scheme-select').append('<option>' + scheme + '</option>');}
      );
      _.each(
        _.reject(Malifaux.getAvailableSchemes(true), function(s) { return _.contains(schemes, s); }),
        function(scheme) { that.$('select.scheme-select').append('<option>' + scheme + '</option>');}
      );
      _.each(schemes, function(s) { that.$('div.schemes').append('<div><a class="btn btn-danger remove-scheme" value="' + s + '">X</a> ' + s + '</div>');});
      if (schemes.length >= 5) {
        this.$('select.scheme-select').hide();
      }
      $('#changeRoundTriggerElement').change();
      return this;
    },

    onDeploySelect: function(e) {
      this.round.setDeployment(e.target.value);
      this.render();
    },

    onStrategySelect: function(e) {
      this.round.setStrategy(e.target.value);
      this.render();
    },

    onSchemeSelect: function(e) {
      this.round.addScheme(e.target.value);
      this.render();
    },

    removeScheme: function(e) {
      this.round.removeScheme($(e.target).attr('value'));
      this.render();
    },

    randomizeSchemes: function() {
      var deck = Malifaux.getShuffledDeck(), card, suit, value;

      // schemes
      this.round.setSchemes([]);
      this.round.addAlwaysScheme();
      var validCards = 0
      while (validCards < 2) {
        card = deck.pop();
        if (card.indexOf("Joker") === -1) {
          validCards++;
          value = parseInt(card.split(' of ')[0], 10);
          suit = card.split(' of ')[1];
          this.round.addSchemeForCard(value, suit);
        }
      }
      this.render();
    },

    randomizeGG16Schemes: function() {
      var deck = Malifaux.getShuffledDeck(), card, suit, value;

      // schemes
      this.round.setSchemes([]);
      this.round.addAlwaysScheme(true);
      var validCards = 0
      while (validCards < 2) {
        card = deck.pop();
        if (card.indexOf("Joker") === -1) {
          validCards++;
          value = parseInt(card.split(' of ')[0], 10);
          suit = card.split(' of ')[1];
          this.round.addSchemeForCard(value, suit, true);
        }
      }
      this.render();
    }

  });
  return RoundSettingsView;
});