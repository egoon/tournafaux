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
  'localstorage',
], function($, _, Backbone, localstorage){
    var Settings = Backbone.Model.extend({

        initialize: function() {

            if (!this.id) {
                this.set("id", "settings");
            }
            if (!this.get("rounds")) {
                this.set("rounds", "3");
                }
            if (!this.get("tables")) {
                this.set("tables", "");
            }
            if (!this.get('bye')) {
                this.set('bye', this.AVERAGE_BYE);
            }
            if (!this.get('tournamentType')) {
                this.set('tournamentType', this.SWISS);
            }
            if (!this.get('version')) {
                this.set('version', '1');
            }
        },

      getRounds: function() {
        return parseInt(this.get('rounds'));
      },
      setRounds: function(rounds) {
        this.set('rounds', rounds.toString());
        this.save();
      },
      getTables: function() {
        return parseInt(this.get('tables'));
      },
      setTables: function(tables) {
        this.set('tables', tables.toString());
        this.save();
      },
      isGG14: function() {
        return this.get('gg14') === 'true';
      },
      setGG14: function(gg14) {
        this.set('gg14', (gg14 && gg14 != 'false').toString());
        this.save();
      },
      getBye: function() {
        var bye =  this.get('bye');
        if (bye === this.GG14_BYE) {
          return this.GG14_BYE;
        } else if (bye === this.COMPETING_RINGER) {
            return this.COMPETING_RINGER;
        } else if (bye === this.NON_COMPETING_RINGER) {
            return this.NON_COMPETING_RINGER;
        } else {
          return this.AVERAGE_BYE;
        }
      },
      setBye: function(bye) {
        this.set('bye', bye);
        this.save();
      },
      getTournamentType: function() {
          var tournamentType =  this.get('tournamentType');
          if (tournamentType === this.GG14_SWISS) {
              return this.GG14_SWISS;
          } else {
              return this.SWISS;
          }
      },
      setTournamentType: function(tournamentType) {
          this.set('tournamentType', tournamentType);
          this.save();
      },
      AVERAGE_BYE: 'average-bye',
      GG14_BYE: 'gg14-bye',
      COMPETING_RINGER: 'competing-ringer',
      NON_COMPETING_RINGER: 'non-competing-ringer',
      SWISS: 'swiss',
      GG14_SWISS: 'gg14-swiss',

      localStorage: new Backbone.LocalStorage("tournafaux-settings")

    });
  return Settings;
});