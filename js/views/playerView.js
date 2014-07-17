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
  'text!../../templates/player.tpl'
], function($, _, Backbone, playerTemplate) {

	var PlayerView = Backbone.View.extend({
		tagName: "tr",

		initialize: function(options) {
			this.player = options.player;
			this.playerList = options.playerList;
			this.roundList = options.roundList;
      this.listenTo(this.player, 'change:ringer', this.render);
      this.listenTo(this.player, 'change:nonCompeting', this.render);

		},

		events: {
			"click button.removePlayer": "removePlayer",
      "change input": "updateProperty"
		},

		render: function() {
			var template =_.template(playerTemplate, {player: this.player});
			this.$el.html(template);
			this.$el.attr('id', this.player.id);
      this.validate();
		},

    updateProperty: function(e) {
      this.player.set(e.currentTarget.name, e.currentTarget.value);
      this.player.save();
      if (e.currentTarget.name === 'name')
        e.currentTarget.value = this.player.getName();
      return false;
    },

		removePlayer: function() {
			this.roundList.fetch();
			this.playerList.fetch();
			var that = this;
			if (this.roundList.length > 0) {
				if (confirm("This will destroy all generated rounds!")) {
					this.playerList.each(function(player) {
						player.clearGames(that.roundList.length);
						player.save();
					});
					this.player.destroy();
					while(this.roundList.at(0)) {
						this.roundList.at(0).destroy();
					}
					this.$el.hide(function() {that.remove()});
					
				}
			} else {
				this.player.destroy();
				this.$el.hide(function() {that.remove()});
			}

			return false;
		},

    validate: function() {
      if (this.player.isBye()) {
        this.$el.hide();
      } else {
        this.$el.show();
      }
      if (this.player.isNonCompeting()) {
        this.$('#city').attr('disabled', 'true');
        this.$('#faction').attr('disabled', 'true');
      } else {
        this.$('#city').removeAttr('disabled');
        this.$('#faction').removeAttr('disabled');
      }
      if (this.player.isRinger()) {
        this.$('#removePlayer').hide();
      }
    }
	});
  
  	return PlayerView;
});