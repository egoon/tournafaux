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
        this.router.navigate('/');
      }
      return false;
    }
	});
  	return NavigationView;
});