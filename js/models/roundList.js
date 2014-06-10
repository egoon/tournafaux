define([
  'backbone',
  'localstorage',
], function(Backbone, localstorage){
  var Round = Backbone.Model.extend({});

	var RoundList = Backbone.Collection.extend({

		model: Round,

		localStorage: new Backbone.LocalStorage("tournafaux-rounds"),

		
	});
  return RoundList;
});