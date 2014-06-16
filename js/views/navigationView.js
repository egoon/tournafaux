define([
  'underscore',
  'backbone',
  'text!../../templates/navigation.html',
], function(_, Backbone, navigationTemplate) {
  	var NavigationView = Backbone.View.extend({
		tagName: 'div',

		initialize: function(options) {
			this.roundList = options.roundList;
			this.roundList.fetch();
			this.active = options.active;
			
			this.listenTo(this.roundList, 'remove', this.render);
			this.listenTo(this.roundList, 'reset', this.render);
			this.listenTo(this.roundList, 'add', this.render);
		},

		render: function() {
			var rounds = _.sortBy(this.roundList.models, function(round){ return parseInt(round.get('number'));});
			var template = _.template(navigationTemplate, {rounds: rounds, active: this.active});
		    this.$el.html(template);
		},
	});
  	return NavigationView;
});