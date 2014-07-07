"use strict";
define([
  'backbone',
  'localstorage',
], function(Backbone, localstorage){
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
		}
  	});

	var RoundList = Backbone.Collection.extend({

		model: Round,

		localStorage: new Backbone.LocalStorage("tournafaux-rounds"),

		
	});
  return RoundList;
});