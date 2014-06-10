define([
  'underscore',
  'backbone',
  'text!../../templates/navigation.html',
], function(_, Backbone, navigationTemplate) {
  	var NavigationView = Backbone.View.extend({
		el: '#navigation',

		initialize: function(options) {
			this.roundList = options.roundList;
			this.roundList.fetch();
			this.roundList.sortBy(function(round){ return parseInt(round.get('number'));});
			this.active = options.active;
			
			this.listenTo(this.roundList, 'remove', this.render);
			this.listenTo(this.roundList, 'reset', this.render);
			this.listenTo(this.roundList, 'add', this.render);
		},

		render: function() {
			var template = _.template(navigationTemplate, {rounds: this.roundList, active: this.active});
		    this.$el.html(template);
		},
	});
  	return NavigationView;
});