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
"use strict";
define([
  'backbone',
  'localstorage',
], function(Backbone, localstorage) {
	var Round = Backbone.Model.extend({
      getTables: function(noTables, playerList) {
			var tables = [];
			for (var i = 1; i <= noTables; ++i) {
				if (this.get('table' + i + 'player1')) {
					tables.push(this.getTable(i, playerList));
				}
			}
			if (this.get('table-player1')) {
				tables.push(this.getTable('-', playerList));
			}
			return tables;
		},
		getTable: function(number, playerList) {
			var table = {
				name: number.toString(),
				player1id: this.get('table' + number + 'player1'),
				player2id: this.get('table' + number + 'player2')
			};
			if (playerList) {
				table.player1 = playerList.get(table.player1id);
				table.player2 = playerList.get(table.player2id);
			}
			return table;
		},

		setPlayer1ForTable: function(table, player) {
			this.set('table' + table + 'player1', player.id);
		},
		setPlayer2ForTable: function(table, player) {
			this.set('table' + table + 'player2', player.id);
		},

		getNumber: function() {
			return parseInt(this.get('number'));
		}
	});

	var RoundList = Backbone.Collection.extend({

		model: Round,

		localStorage: new Backbone.LocalStorage("tournafaux-rounds")

		
	});
  return RoundList;
});