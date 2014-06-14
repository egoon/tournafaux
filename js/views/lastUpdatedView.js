define([
  'underscore',
  'backbone',
  'text!../../templates/lastUpdated.html',
], function(_, Backbone, lastUpdatedTemplate) {
  	var LastUpdatedView = Backbone.View.extend({
  		el: "#last-updated",
		render: function() {
			var template = _.template(lastUpdatedTemplate);
		    this.$el.html(template);
		},
  	});
  	
  	return LastUpdatedView;
});