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
            if (!this.get('pairings')) {
                this.set('pairings', 'average-bye');
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
      setTables: function(rounds) {
        this.set('tables', rounds.toString());
        this.save();
      },
      getBye: function() {
        var bye =  this.get('bye');
        if (bye == this.GG14_BYE) {
          return this.GG14_BYE;
        } else if (bye == this.COMPETING_RINGER) {
            return this.COMPETING_RINGER;
        } else if (bye == this.NON_COMPETING_RINGER) {
            return this.NON_COMPETING_RINGER;
        } else {
          return this.AVERAGE_BYE;
        }
      },
      setBye: function(bye) {
        this.set('bye', bye);
        this.save();
      },
      getPairings: function() {
          var pairings =  this.get('pairings');
          if (pairings == this.GG14_PAIRINGS) {
              return this.GG14_PAIRINGS;
          } else {
              return this.NEVER_MEET_TWICE;
          }
      },
      setPairings: function(pairings) {
          this.set('pairings', pairings);
          this.save();
      },
      AVERAGE_BYE: 'average-bye',
      GG14_BYE: 'gg14-bye',
      COMPETING_RINGER: 'competing-ringer',
      NON_COMPETING_RINGER: 'non-competing-ringer',
      NEVER_MEET_TWICE: 'never-meet-twice',
      GG14_PAIRINGS: 'gg14-pairings',

      localStorage: new Backbone.LocalStorage("tournafaux-settings"),

    });
  return Settings;
});