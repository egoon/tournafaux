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
/*global define*/

define([
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/roundSettings.tpl'
], function($, _, Backbone, roundSettingsTemplate) {
  "use strict";
  var RoundSettingsView = Backbone.View.extend({
    tagName: 'div',

    initialize: function(options) {
      this.round = options.round;
    },

    render: function () {
      var template = _.template(roundSettingsTemplate, {round: this.round});
      this.$el.html(template);

      return this;
    }
  });
  return RoundSettingsView;
});