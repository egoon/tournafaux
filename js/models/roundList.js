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
    'logic/malifaux'
], function (Backbone, localstorage, Malifaux) {
    var Round = Backbone.Model.extend({

        clear: function () {
            var i = 1;
            while (this.get('table' + i + 'player1')) {
                this.set('table' + i + 'player1', undefined);
                this.set('table' + i + 'player2', undefined);
                i++;
            }
            this.unset('table-player1');
            this.unset('table-player2');
        },

        getTables: function (noTables, playerList) {
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
        getTable: function (number, playerList) {
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

        setPlayersForTable: function (table, player1, player2) {
            this.set('table' + table + 'player1', player1.id);
            this.set('table' + table + 'player2', player2.id);
        },

        clearTable: function (tableNumber) {
            this.unset('table' + tableNumber + 'player1');
            this.unset('table' + tableNumber + 'player2');
        },

        setPlayer1ForTable: function (table, player) {
            this.set('table' + table + 'player1', player.id);
        },
        setPlayer2ForTable: function (table, player) {
            this.set('table' + table + 'player2', player.id);
        },

        getNumber: function () {
            return parseInt(this.get('number'));
        },

        getDeployment: function () {
            return this.get('deployment');
        },

        setDeployment: function (deployment) {
            this.set('deployment', deployment);
            this.save();
        },

        setDeploymentFromCard: function (card) {
            var value = parseInt(card.split(' of ')[0], 10);
            if (value < 8) {
                this.setDeployment(Malifaux.getAvailableDeployments()[0]);
            } else if (value < 11) {
                this.setDeployment(Malifaux.getAvailableDeployments()[1]);
            } else if (value < 13) {
                this.setDeployment(Malifaux.getAvailableDeployments()[2]);
            } else { //Joker
                this.setDeployment(Malifaux.getAvailableDeployments()[3]);
            }
        },

        getStrategy: function () {
            return this.get('strategy');
        },

        setStrategy: function (strategy) {
            this.set('strategy', strategy);
            this.save();
        },

        setStandardStrategy: function (suit) {
            if (suit === 'Rams') {
                this.setStrategy(Malifaux.getAvailableStandardStrategies()[0]);
            } else if (suit === 'Crows') {
                this.setStrategy(Malifaux.getAvailableStandardStrategies()[1]);
            } else if (suit === 'Masks') {
                this.setStrategy(Malifaux.getAvailableStandardStrategies()[2]);
            } else if (suit === 'Tomes') {
                this.setStrategy(Malifaux.getAvailableStandardStrategies()[3]);
            } else { //Joker
                this.setStrategy(Malifaux.getAvailableStandardStrategies()[4]);
            }
        },

        setGG15Strategy: function (suit) {
            if (suit === 'Rams') {
                this.setStrategy(Malifaux.getAvailableGG15Strategies()[0]);
            } else if (suit === 'Crows') {
                this.setStrategy(Malifaux.getAvailableGG15Strategies()[1]);
            } else if (suit === 'Masks') {
                this.setStrategy(Malifaux.getAvailableGG15Strategies()[2]);
            } else if (suit === 'Tomes') {
                this.setStrategy(Malifaux.getAvailableGG15Strategies()[3]);
            } else { //Joker
                this.setStrategy(Malifaux.getAvailableGG15Strategies()[4]);
            }
        },

        getSchemes: function () {
            var schemes = this.get('schemes');
            return schemes ? schemes.split(',') : [];
        },

        setSchemes: function (schemes) {
            if (schemes && schemes.length > 0) {
                this.set('schemes', schemes.join(','));
            } else {
                this.unset('schemes');
            }
            this.save();
        },

        addScheme: function (scheme) {
            var schemes = this.get('schemes');
            if (schemes) {
                this.set('schemes', schemes + ',' + scheme);
            } else {
                this.set('schemes', scheme);
            }
            this.save();
        },

        addAlwaysScheme: function (gg16) {
            this.addScheme(Malifaux.getAvailableSchemes(gg16)[0]);
        },

        addSchemeForCard: function (value, suit, gg16) {
            var schemes = this.getSchemes();
            if (schemes.length > 3) {
                return;
            }
            var addSchemeHandleDoubles = function (scheme, that) {
                if (_.contains(schemes, scheme)) {
                    that.addScheme(Malifaux.getAvailableSchemes(gg16)[1]);
                } else {
                    that.addScheme(scheme);
                }
            };
            addSchemeHandleDoubles(Malifaux.getAvailableSchemes(gg16)[5 + value], this);
            if (suit === 'Masks') {
                addSchemeHandleDoubles(Malifaux.getAvailableSchemes(gg16)[2], this);
            } else if (suit === 'Crows') {
                addSchemeHandleDoubles(Malifaux.getAvailableSchemes(gg16)[3], this);
            } else if (suit === 'Tomes') {
                addSchemeHandleDoubles(Malifaux.getAvailableSchemes(gg16)[4], this);
            } else if (suit === 'Rams') {
                addSchemeHandleDoubles(Malifaux.getAvailableSchemes(gg16)[5], this);
            }
        },

        removeScheme: function (scheme) {
            this.setSchemes(_.filter(this.getSchemes(), function (s) {
                return s !== scheme;
            }));
        },

        pushHistoricSwitch: function (player1id, player2id) {
            var i = 0;
            while (this.get('historicSwitch' + i + 'player1id')) {
                i++;
            }
            this.set('historicSwitch' + i + 'player1id', player1id);
            this.set('historicSwitch' + i + 'player2id', player2id);
        },

        popHistoricSwitch: function () {
            var i = 0;
            while (this.get('historicSwitch' + i + 'player1id')) {
                i++;
            }
            i--;

            return {player1id: this.get('historicSwitch' + i + 'player1id'),
                player2id: this.get('historicSwitch' + i + 'player2id')};
        }
    });

    var RoundList = Backbone.Collection.extend({

        model: Round,

        localStorage: new Backbone.LocalStorage("tournafaux-rounds")


    });
    return RoundList;
});