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
  'text!../../templates/roundSettings.tpl'
], function($, _, Backbone, roundSettingsTemplate) {
  "use strict";
  var RoundSettingsView = Backbone.View.extend({
    tagName: 'div',

    events: {
      "change select.deploy-select": "onDeploySelect",
      "change select.scheme-select": "onSchemeSelect",
      "change select.strategy-select": "onStrategySelect",
      "click a.remove-scheme": "removeScheme",
      "click a.randomize": "randomizeSettings"
    },

    initialize: function(options) {
      this.round = options.round;
    },

    render: function() {
      var that = this;
      var template = _.template(roundSettingsTemplate, {round: this.round});
      this.$el.html(template);

      _.each(
        this.getAvailableDeployments(),
        function(deployment) { that.$('select.deploy-select').append('<option>' + deployment + '</option>');}
      );
      if (this.round.getDeployment()) {
        this.$('select.deploy-select').val(this.round.getDeployment());
      } else {
        this.$('select.deploy-select').prepend('<option selected>[Deployment]</option>');
      }

      _.each(
        this.getAvailableStrategies(),
        function(strategy) { that.$('select.strategy-select').append('<option>' + strategy + '</option>');}
      );
      if (this.round.getStrategy()) {
        this.$('select.strategy-select').val(this.round.getStrategy());
      } else {
        this.$('select.strategy-select').prepend('<option selected>[Strategy]</option>');
      }

      var schemes =  this.round.getSchemes();
      _.each(
        _.reject(this.getAvailableSchemes(), function(s) { return _.contains(schemes, s); }),
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

    randomizeSettings: function() {
      var deck = this.getShuffledDeck(), card, value, suit, that = this;
      // deployment
      card = deck.pop();
      value = parseInt(card.split(' of ')[0], 10);
      if (value < 8) {
        this.round.setDeployment(this.getAvailableDeployments()[0]);
      } else if (value < 11) {
        this.round.setDeployment(this.getAvailableDeployments()[1]);
      } else if (value < 13) {
        this.round.setDeployment(this.getAvailableDeployments()[2]);
      } else { //Joker
        this.round.setDeployment(this.getAvailableDeployments()[3]);
      }
      // strategy
      card = deck.pop();
      suit = card.split(' of ')[1];
      if (suit === 'Rams') {
        this.round.setStrategy(this.getAvailableStrategies()[0]);
      } else if (suit === 'Crows') {
        this.round.setStrategy(this.getAvailableStrategies()[1]);
      } else if (suit === 'Masks') {
        this.round.setStrategy(this.getAvailableStrategies()[2]);
      } else if (suit === 'Tomes') {
        this.round.setStrategy(this.getAvailableStrategies()[3]);
      } else { //Joker
        this.round.setStrategy(this.getAvailableStrategies()[4]);
      }
      // schemes
      suit = [];
      value = [];
      while (suit.length < 2) {
        card = deck.pop();
        if (card.indexOf("Joker") === -1) {
          value.push(parseInt(card.split(' of ')[0], 10));
          suit.push(card.split(' of ')[1]);
        }
      }
      this.round.setSchemes([]);
      this.round.addScheme(this.getAvailableSchemes()[0]);
      if (suit[0] === suit[1]) {
        this.round.addScheme(this.getAvailableSchemes()[1]);
        suit.pop();
      }
      if (value[0] === value[1]) {
        this.round.addScheme(this.getAvailableSchemes()[1]);
        value.pop();
      }
      _.each(suit, function(s) {
        if (s === 'Masks') {
          this.round.addScheme(this.getAvailableSchemes()[2]);
        } else if (s === 'Crows') {
          this.round.addScheme(this.getAvailableSchemes()[3]);
        } else if (s === 'Tomes') {
          this.round.addScheme(this.getAvailableSchemes()[4]);
        } else if (s === 'Rams') {
          this.round.addScheme(this.getAvailableSchemes()[5]);
        }
      }, this);
      _.each(value, function(v) {
        this.round.addScheme(this.getAvailableSchemes()[5 + v]);
      }, this);
      this.render();
    },

    getAvailableSchemes: function() {
      var schemes = [];
      schemes.push("A Line in the Sand (Always)","Distract (Doubles)",
        "Breakthrough (Mask)","Assassinate (Crow)","Protect Territory (Tome)","Bodyguard (Ram)",
        "Cursed Object (1)","Outflank (2)","Plant Evidence (3)","Entourage (4)","Vendetta (5)",
        "Plant Explosives (6)","Make them Suffer (7)","Deliver a Message (8)","Take Prisoner (9)",
        "Spring the Trap (10)","Murder Protégé (11)","Frame for Murder (12)","Power Ritual (13))");
      return schemes;
    },
    getAvailableStrategies: function() {
      var strategies = [];
      strategies.push("Turf War (Ram)", "Reckoning (Crow)", "Reconnoiter (Mask)", "Squatter's Rights (Tome)", "Stake a Claim (Joker)");
      return strategies;
    },
    getAvailableDeployments: function() {
      var deployments = [];
      deployments.push("Standard (1-7)", "Corner (8-10)", "Flank (11-13)", "Close (Jokers)");
      return deployments;
    },
    getShuffledDeck: function() {
      var cards = [], suit, value, suits = ['Masks', 'Tomes', 'Crows', 'Rams'];
      cards.push("Red Joker", "Black Joker");
      for (suit = 0; suit < 4; ++suit) {
        for (value = 1; value <= 13; ++value) {
          cards.push(value + ' of ' + suits[suit]);
        }
      }
      return _.shuffle(cards);
    }


  });
  return RoundSettingsView;
});