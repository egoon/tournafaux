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
  'underscore',
  'backbone',
  'text!../../templates/lastUpdated.tpl',
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