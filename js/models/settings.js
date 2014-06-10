define([
  'jquery',
  'underscore',
  'backbone',
  'localstorage',
], function($, _, Backbone, localstorage){
  var Settings = Backbone.Model.extend({

        localStorage: new Backbone.LocalStorage("tournafaux-settings"),

    });
  return Settings;
});