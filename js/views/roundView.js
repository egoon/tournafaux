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
/*globals define */
define([
    'jquery',
    'underscore',
    'backbone',
    'logic/generateRound',
    'logic/helpTexts',
    'views/standingsView',
    'text!../../templates/round.tpl',
    'dragula'
], function ($, _, Backbone, GenerateRound, HelpTexts, StandingsView, roundTemplate, Dragula) {
    "use strict";
    var RoundView = Backbone.View.extend({

        tagName: 'div',

        initialize: function (options) {
            this.playerList = options.playerList;
            this.playerList.fetch();
            this.roundList = options.roundList;
            this.roundList.fetch();

            this.settings = options.settings;
            this.settings.fetch();

            this.router = options.router;

            this.round = _.find(this.roundList.models, function (round) {
                return round.get("number") === options.active.toString();
            });

            this.listenTo(this.playerList, 'change', this.validate);
        },

        events: {
            "click #generate-next-round": "generateRound",
            "click #end-tournament": "showResultsPage",
            "click #disqualify-button": "disqualifyPlayer",
            "click #disqualify-now-button": "disqualifyPlayerNow",
            "change td .player-vp input": "changeVP",
            "click #helpDisqualify": "showHelpDisqualify",
            "click #undo-button": "undoSwitchPlayers"
        },

        render: function () {
            var self = this;
            if (this.round) {
                this.playerList.fetch();
                this.roundList.fetch();
                var noTables = this.settings.getTables();

                var tables = this.round.getTables(noTables, this.playerList);

                var number = this.round.get('number');

                _.each(tables, function (table) {
                    table.player1name = table.player1.getName();
                    table.player2name = table.player2.getName();
                    table.player1id = table.player1.id;
                    table.player2id = table.player2.id;
                    if (table.player1.isBye()) {
                        table.player1vp = '5';
                    } else {
                        table.player1vp = table.player1.getVpForRound(number) || "";
                    }
                    if (table.player2.isBye()) {
                        table.player2vp = '5';
                    } else {
                        table.player2vp = table.player2.getVpForRound(number) || "";
                    }
                });

                var template = _.template(roundTemplate, {
                    number: number,
                    tables: tables,
                    settings: this.settings,
                    players: this.playerList.getCompetingPlayers()
                });
                this.$el.html(template);

                this.$el.find('#undo-button').hide();

                if (this.settings.getRounds() <= parseInt(number, 10)) {
                    this.$('#generate-next-round').hide();
                } else {
                    this.$('#end-tournament').hide();
                }

                this.$("#standings").html(new StandingsView({
                    playerList: this.playerList,
                    showFactions: false
                }).render().el);
                var evictedPlayer;
                var drake = Dragula(this.$('#round-table-body .table-row').toArray(),
                    {
                        invalid: function (a, b) {
                            return b && b.getAttribute('class') && b.getAttribute('class').indexOf('gu-unselectable') >= 0;
                        },
                        accepts: function (mover, origin, destination, rightNeighbor) {
                            if (!rightNeighbor)
                                return false;
                            if (rightNeighbor && rightNeighbor.getAttribute('class') && rightNeighbor.getAttribute('class').indexOf('gu-unselectable') >= 0)
                                return false;
                            if (origin === destination) {
                                if (evictedPlayer) $(evictedPlayer).show();
                                evictedPlayer = undefined;
                            } else if (rightNeighbor && rightNeighbor !== evictedPlayer && mover !== rightNeighbor) {
                                if (evictedPlayer) $(evictedPlayer).show();
                                evictedPlayer = rightNeighbor;
                                $(evictedPlayer).hide();
                            }
                            return true;
                        }
                    });

                drake.on('drop', function (mover, destination, origin) {
                    if (evictedPlayer) {
                        $(evictedPlayer).show();
                        destination.removeChild(evictedPlayer);
                        origin.appendChild(evictedPlayer);
                        self.switchPlayers($(mover).find('input').attr('id'), $(evictedPlayer).find('input').attr('id'));
                        //self.$el.find('#undo-button').show();
                    }
                    evictedPlayer = undefined;
                });
            } else {
                this.$el.html(_.template("<h4>Round does not exist</h4>Sorry!"));
            }
            HelpTexts.showHelpText('switchingPlayers');
            return this;
        },

        switchPlayers: function (player1id, player2id) {
            GenerateRound.switchPlayers(this.playerList.get(player1id), this.playerList.get(player2id), this.round);
            this.render();
            this.round.pushHistoricSwitch(player1id, player2id);
        },

        undoSwitchPlayers: function() {
            var switched = this.round.popHistoricSwitch();
            GenerateRound.switchPlayers(this.playerList.get(switched.player1id), this.playerList.get(switched.player2id), this.round);
            // TODO quick workaround. Make this better
            this.render();
            console.log(switched);
            if (switched.history > 0)
                this.$el.find('#undo-button').show();
        },

        changeVP: function (event) {
            var number = this.round.get('number');
            var player = this.playerList.get(event.currentTarget.id);
            if (parseInt(event.currentTarget.value, 10) >= 0) {
                player.setVpForRound(number, event.currentTarget.value);
            } else {
                event.currentTarget.value = '';
                player.setVpForRound(number, '');
            }
            player.save();
            this.calculateTpAndVpDiff(this.round, player);
        },

        calculateTpAndVpDiff: function (round, player) { //TODO: refactor to tableView
            var tables = round.getTables(this.settings.getTables(), this.playerList);
            var number = round.get('number');
            var i, table, player1, player2, player1vp, player2vp, diff;
            for (i = 0; i < tables.length; ++i) {
                table = tables[i];
                player1 = table.player1;
                player2 = table.player2;
                if (player1.id === player.id || player2.id === player.id) {
                    player1vp = parseInt(player1.getVpForRound(number), 10);
                    player2vp = parseInt(player2.getVpForRound(number), 10);
                    if (player1vp >= 0 && player2vp >= 0) {
                        diff = player1vp - player2vp;
                        player1.setVpDiffForRound(number, diff);
                        player2.setVpDiffForRound(number, -diff);
                        player1.setTpForRound(number, diff > 0 ? 3 : diff < 0 ? 0 : 1);
                        player2.setTpForRound(number, diff < 0 ? 3 : diff > 0 ? 0 : 1);
                        player1.save();
                        player2.save();
                    } else {
                        player1.setVpDiffForRound(number, 0);
                        player2.setVpDiffForRound(number, 0);
                        player1.setTpForRound(number, 0);
                        player2.setTpForRound(number, 0);
                        player1.save();
                        player2.save();
                    }
                }
            }
        },

        validate: function () {
            this.errors = [];

            var tables = this.round.getTables(this.settings.get('tables'), this.playerList);

            for (var i = 0; i < tables.length; ++i) {
                if (!tables[i].player1.isBye() && !tables[i].player2.isBye()) {
                    var vp = tables[i].player1.getVpForRound(this.round.get('number'))
                    if (isNaN(vp)) {
                        this.errors.push(tables[i].player1.getName() + ' has no registered victory points');
                    }
                    vp = tables[i].player2.getVpForRound(this.round.get('number'))
                    if (isNaN(vp)) {
                        this.errors.push(tables[i].player2.getName() + ' has no registered victory points');
                    }
                }
            }

            this.$('#validation-errors').html('');
            for (var i = 0; i < this.errors.length; ++i) {
                this.$('#validation-errors').append('<li>' + this.errors[i] + '</li>');
            }
        },

        generateRound: function () {
            console.log('generate round ' + (this.round.getNumber() + 1));
            this.validate();
            if (this.errors.length > 0) {
                this.$('#validation-errors').show();
            } else {
                var number = parseInt(this.round.get('number')) + 1;
                GenerateRound.generate(number, this.playerList, this.roundList, this.settings);
                this.router.navigate("#/round/" + number);
                $('#changeRoundTriggerElement').change(); // trigger the roundInfoView to change round
            }
            return false;
        },

        showResultsPage: function () {
            this.validate();
            if (this.errors.length > 0) {
                this.$('#validation-errors').show();
            } else {
                this.router.navigate("#/results");
            }
            return false;
        },

        disqualifyPlayer: function () {
            var player = this.playerList.get(this.$('#disqualify-select').val());
            if (player.isRinger()) {
                alert("Removing ringer not supported");
            } else {
                if (confirm("Are you sure you want to remove " + player.getName() + " from the tournament?")) {
                    player.setActive(false);
                    player.save();
                }
            }
        },

        disqualifyPlayerNow: function () {
            var player = this.playerList.get(this.$('#disqualify-select').val());
            if (player.isRinger()) {
                alert("Removing ringer not supported");
            } else {
                if (confirm("Are you sure you want to remove " + player.getName() + " from the tournament? They will be removed immediately, and the matchings will probably change")) {
                    player.setActive(false);
                    var roundNumber = this.round.getNumber();
                    var opp = this.playerList.get(player.getOpponentIdForRound(roundNumber));
                    var table = player.getTableForRound(roundNumber);
                    if (opp.isBye() || opp.isRinger()) {
                        this.round.clearTable(table);
                        opp.setNonCompeting(true);
                    } else {
                        var byeRinger = this.playerList.getByeRinger();
                        var byeRingerTable = _.find(this.round.getTables(this.settings.getTables()), function (t) {
                            return t.player1id === byeRinger.id || t.player2id === byeRinger.id
                        });
                        var newOpp;
                        if (byeRingerTable) {
                            if (byeRingerTable.player1id === byeRinger.id) {
                                newOpp = this.playerList.get(byeRingerTable.player2id);
                            } else {
                                newOpp = this.playerList.get(byeRingerTable.player1id);
                            }
                            this.round.clearTable(byeRingerTable.name);
                        } else {
                            newOpp = byeRinger;
                        }
                        //TODO switch player feature?

                        opp.clearGame(roundNumber);
                        newOpp.clearGame(roundNumber);
                        opp.setOpponentIdForRound(roundNumber, newOpp.id);
                        newOpp.setOpponentIdForRound(roundNumber, opp.id);
                        opp.setTableForRound(roundNumber, table);
                        newOpp.setTableForRound(roundNumber, table);
                        this.round.setPlayersForTable(table, opp, newOpp);
                        if (newOpp.isBye()) {
                            GenerateRound.setScoresForBye(newOpp, opp, roundNumber);
                        }
                        opp.save();
                        newOpp.save();
                        this.round.save();
                    }
                    console.log(opp);
                    console.log(table);
                    player.save();
                }
                this.render();
            }
        },

        showHelpDisqualify: function () {
            HelpTexts.showHelpText("disqualify");
        }

    });
    return RoundView;
});