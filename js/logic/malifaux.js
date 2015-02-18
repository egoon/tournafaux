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
  'underscore'
], function(_) {
  "use strict";

	var malifaux = {
    getAvailableSchemes: function() {
      var schemes = [];
      schemes.push("A Line in the Sand (Always)","Distract (Doubles)",
        "Breakthrough (Mask)","Assassinate (Crow)","Protect Territory (Tome)","Bodyguard (Ram)",
        "Cursed Object (1)","Outflank (2)","Plant Evidence (3)","Entourage (4)","Vendetta (5)",
        "Plant Explosives (6)","Make them Suffer (7)","Deliver a Message (8)","Take Prisoner (9)",
        "Spring the Trap (10)","Murder Protégé (11)","Frame for Murder (12)","Power Ritual (13)");
      return schemes;
    },
    getAvailableStandardStrategies: function() {
      var strategies = [];
      strategies.push("Turf War (Ram)", "Reckoning (Crow)", "Reconnoiter (Mask)", "Squatter's Rights (Tome)", "Stake a Claim (Joker)");
      return strategies;
    },
    getAvailableGG15Strategies: function() {
      var strategies = [];
      strategies.push("Extraction (Ram)", "Guard the Stash (Crow)", "Interference (Mask)", "Headhunter (Tome)", "Collect the Bounty (Joker)");
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
  };

	return malifaux;
});