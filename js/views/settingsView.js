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
  'logic/generateRound',
  'logic/helpTexts',
  'views/playerView',
  'views/roundSettingsView',
  'text!../../templates/settings.tpl',
  'logic/malifaux'
], function ($, _, Backbone, GenerateRound, HelpTexts, PlayerView, RoundSettingsView, settingsTemplate, Malifaux) {
  "use strict";
  var SettingsView = Backbone.View.extend({

    tagName: 'div',

    events: {
      "keypress #new-player": "createOnEnter",
      "click #generate-first-round": "generateRound",
      "change #rounds": "changeRounds",
      "change #tables": "changeTables",
      "click input[name=gg14]": "toggleGG14",
      "click input[name=chooseFirstOpponent]": "toggleChooseFirstOpponent",
      "click input[name=byes]": "changeBye",
      "click input[name=tournamentType]": "changeTournamentType",
      "click #helpCityFaction": "showHelpCityFaction",
      "focus input.city": "showHelpCityFaction",
      "focus input.faction": "showHelpCityFaction",
      "click #helpBye": "showHelpBye",
      "click #helpRinger": "showHelpRinger",
      "click #helpTournamentType": "showHelpTournamentType",
      "click #helpGG14": "showHelpGG14",
      "click #helpChooseFirstOpponent": "showHelpChooseFirstOpponent",
      "click #helpRoundSettings": "showHelpRoundSettings",
      "click #toggle-round-settings": "toggleRoundsVisibility",
      "change #rotation": "changeRotation"
    },

    initialize: function (options) {
      this.playerList = options.playerList;
      this.playerList.fetch();
      this.roundList = options.roundList;
      this.roundList.fetch();

      this.settings = options.settings;
      this.settings.fetch();

      this.router = options.router;

      this.listenTo(this.playerList, 'add', this.validate);
      this.listenTo(this.playerList, 'remove', this.validate);
      this.listenTo(this.playerList, 'reset', this.validate);
      this.listenTo(this.settings, 'change:rounds', this.validate);
      this.listenTo(this.settings, 'change:tables', this.validate);

      this.byeRinger = this.playerList.getByeRinger();
    },

    render: function () {
      var template = _.template(settingsTemplate, {settings: this.settings});
      this.$el.html(template);
      this.newPlayerInput = this.$("#new-player");

      this.$('input[name="byes"]').filter('[value="' + this.settings.getBye() + '"]').prop('checked', true);
      this.$('input[name="tournamentType"]').filter('[value="' + this.settings.getTournamentType() + '"]').prop('checked', true);
      if (this.settings.isGG14()) {
        this.$('input[name=gg14]').prop('checked', true);
        this.$('input[name="byes"][value="average-bye"]').prop('disabled', true);
        this.$('input[name="tournamentType"][value="swiss"]').prop('disabled', true);
      }
      var i = 0;
      while (this.playerList.at(i)) {
        this.addPlayerView(this.playerList.at(i));
        ++i;
      }

      this.changeRounds(); // create rounds if needed
      _.each(this.roundList.models, function(round) {
        this.addRoundSettingsView(round);
      }, this);

      if (this.settings.isChooseFirstOpponent()) {
        this.$('input[name=chooseFirstOpponent]').prop('checked', true);
      }
      this.validate();

      this.$('#round-settings').hide();
      return this;
    },

    addPlayerView: function (player) {
      var playerView = new PlayerView({
        player: player,
        playerList: this.playerList,
        roundList: this.roundList,
        settings: this.settings,
      });
      playerView.render();
      this.$("#new-player-row").before(playerView.el);
      if (!this.settings.isChooseFirstOpponent()) {
        this.$('.chooseFirstOpponent').hide();
      }
    },

    addRoundSettingsView: function (round) {
      var roundSettingsView = new RoundSettingsView({round: round, settings: this.settings});
      roundSettingsView.render();
      this.$("#round-settings").append(roundSettingsView.el);
    },

    createOnEnter: function (e) {
      if (e.keyCode !== 13 && e.keyCode !== 9) { return; }
      if (!this.newPlayerInput.val()) { return; }

      var player = this.playerList.create({number: this.playerList.length, name: this.newPlayerInput.val(), city: '', faction: ''});
      player.save();
      this.newPlayerInput.val('');
      this.addPlayerView(player);
    },

    changeRounds: function () {
      if (isNaN(this.$("#rounds").val())) {
        this.$("#rounds").val('');
      }
      this.settings.setRounds(this.$("#rounds").val());
      while (this.settings.getRounds() > this.roundList.length) {
        var number = this.roundList.length + 1;
        // console.log(number);
        this.roundList.create({number: number.toString()});
        // this.addRoundSettingsView(this.roundList.at(number));
      }
      var len = this.roundList.length;
      while (this.settings.getRounds() < this.roundList.length) {
        this.roundList.at(this.settings.getRounds()).destroy();

        if (len === this.roundList.length) {
          console.log('not working');
          break;
        }
      }

    },

    changeTables: function () {
      if (isNaN(this.$("#tables").val())) {
        this.$("#tables").val('');
      }
      this.settings.setTables(this.$("#tables").val());
    },

    toggleGG14: function () {
      var isGG14 = this.$('input[name=gg14]').prop('checked');
      this.settings.setGG14(isGG14);
      if (isGG14 && this.settings.getBye() === this.settings.AVERAGE_BYE) {
        this.settings.setBye(this.settings.GG14_BYE);
        this.$('input[name="byes"][value="gg14-bye"]').prop('checked', true);
      }
      if (isGG14 && this.settings.getTournamentType() === this.settings.SWISS) {
        this.settings.setTournamentType(this.settings.GG14_SWISS);
        this.$('input[name="tournamentType"][value="gg14-swiss"]').prop('checked', true);
      }
      this.$('input[name="byes"][value="average-bye"]').prop('disabled', isGG14);
      this.$('input[name="tournamentType"][value="swiss"]').prop('disabled', isGG14);
      this.showHelpGG14();
    },

    toggleChooseFirstOpponent: function () {
      var isChooseFirstOpponent = this.$('input[name=chooseFirstOpponent]').prop('checked');
      this.settings.setChooseFirstOpponent(isChooseFirstOpponent);
      if (isChooseFirstOpponent) {
        this.$('.chooseFirstOpponent').show();
      } else {
        this.playerList.each(function (player) {
          player.setFirstOpponent(undefined);
        });
        this.$('.chooseFirstOpponent').hide();
      }
      this.showHelpChooseFirstOpponent();
    },

    changeBye: function () {
      this.settings.setBye(this.$('input[name="byes"]:checked').val());
      if (this.settings.getBye() === this.settings.AVERAGE_BYE || this.settings.getBye() === this.settings.GG14_BYE) {
        this.byeRinger.setBye(true);
        this.byeRinger.setNonCompeting(true);
      } else {
        this.byeRinger.setRinger(true);
        if (this.settings.getBye() === this.settings.COMPETING_RINGER) {
          this.byeRinger.setNonCompeting(false);
        } else {
          this.byeRinger.setNonCompeting(true);
        }
      }
      this.byeRinger.save();
      this.toggleChooseFirstOpponent(); // to make sure chooseOpponent is hidden
      this.showHelpBye();
    },

    changeTournamentType: function () {
      this.settings.setTournamentType(this.$('input[name="tournamentType"]:checked').val());
      this.showHelpTournamentType();
    },

    generateRound: function () {
      this.validate();
      if (this.errors.length > 0) {
        this.$('#validation-errors').show();
      } else {
        if (isNaN(this.settings.getTables())) {
          this.settings.setTables(Math.floor(this.playerList.length / 2));
          this.settings.save();
        }
        this.playerList.each(function (player) {
          player.setActive(true);
          player.save();
        });
        GenerateRound.generate(1, this.playerList, this.roundList, this.settings);
        this.router.navigate("#/round/1");
        this.settings.roundInfoWindow && this.settings.roundInfoWindow.close();
        this.remove();
      }
      return false;
    },

    validate: function () {
      var i, numPlayers, minTables;
      this.errors = [];
      // rounds
      if (isNaN(this.settings.getRounds())) {
        this.errors.push('You must select a number of rounds');
      } else if (this.settings.getRounds() >= this.playerList.length) {
        this.errors.push('You must have more players than rounds');
      }
      // tables
      numPlayers = this.playerList.length - (this.settings.isBye() ? 1 : 0);
      minTables = Math.floor(numPlayers / 2);
      if (!isNaN(this.settings.getTables()) && this.settings.getTables() < minTables) {
        this.errors.push('You need at least ' + minTables + ' tables for ' + numPlayers + ' players');
      }

      this.$('#validation-errors').html('');
      for (i = 0; i < this.errors.length; ++i) {
        this.$('#validation-errors').append('<li>' + this.errors[i] + '</li>');
      }
    },

    toggleRoundsVisibility: function() {
      this.$('#round-settings').toggle();
      this.showHelpRoundSettings();
    },

    changeRotation: function(e) {
      var deployments, strategies;
      var avDeps = Malifaux.getAvailableDeployments();
      var avStandard = Malifaux.getAvailableStandardStrategies();
      var avGG15 = Malifaux.getAvailableGG15Strategies();

      if (e.target.selectedIndex == 1) {
        //Standard, Corner, Standard, Flank, Close
        deployments = [avDeps[0], avDeps[1], avDeps[0], avDeps[2], avDeps[3]];
        strategies = [avGG15[2], avStandard[0], avGG15[3], avStandard[3], avStandard[4]];
      } else if (e.target.selectedIndex == 2) {
        //Flank, Standard, Close, Corner, Standard
        deployments = [avDeps[2], avDeps[0], avDeps[3], avDeps[1], avDeps[0]];
        strategies = [avStandard[2], avGG15[0], avGG15[4], avStandard[1], avGG15[1]];
      } else if (e.target.selectedIndex == 3) {
        //Corner, Standard, Flank, Standard, Close
        deployments = [avDeps[1], avDeps[0], avDeps[2], avDeps[0], avDeps[3]];
        strategies = [avGG15[1], avStandard[0], avGG15[3], avStandard[1], avGG15[0]];
      } else if (e.target.selectedIndex == 4) {
        //Corner, Standard, Flank, Standard, Close
        deployments = [avDeps[0], avDeps[2], avDeps[0], avDeps[0], avDeps[1]];
        strategies = [avGG15[4], avGG15[2], avStandard[4], avStandard[2], avStandard[3]];
      } else if (e.target.selectedIndex == 5 || e.target.selectedIndex == 9) {
        //Standard, Flank, Standard, Standard, Corner
        deployments = [avDeps[0], avDeps[2], avDeps[0], avDeps[0], avDeps[1]];
        strategies = [avStandard[0], avStandard[1], avStandard[3], avStandard[2], avStandard[4]];
        if (e.target.selectedIndex < 9) {
          strategies[0] = avGG15[0];
          strategies[2] = avGG15[3];
        }
      } else if (e.target.selectedIndex == 6 || e.target.selectedIndex == 10) {
        //Flank, Standard, Close, Corner, Standard
        deployments = [avDeps[2], avDeps[0], avDeps[3], avDeps[1], avDeps[0]];
        strategies = [avStandard[2], avStandard[4], avStandard[1], avStandard[3], avStandard[0]];
        if (e.target.selectedIndex < 9) {
          strategies[0] = avGG15[2];
          strategies[1] = avGG15[4];
          strategies[2] = avGG15[1];
        }
      } else if (e.target.selectedIndex == 7 || e.target.selectedIndex == 11) {
        //Corner, Standard, Flank, Standard, Close
        deployments = [avDeps[1], avDeps[0], avDeps[2], avDeps[0], avDeps[3]];
        strategies = [avStandard[3], avStandard[0], avStandard[4], avStandard[1], avStandard[2]];
        if (e.target.selectedIndex < 9) {
          strategies[0] = avGG15[3];
          strategies[2] = avGG15[4];
        }
      } else if (e.target.selectedIndex == 8 || e.target.selectedIndex == 12) {
        //Corner, Standard, Flank, Standard, Close
        deployments = [avDeps[0], avDeps[2], avDeps[3], avDeps[0], avDeps[1]];
        strategies = [avStandard[1], avStandard[2], avStandard[0], avStandard[4], avStandard[3]];
        if (e.target.selectedIndex < 9) {
          strategies[0] = avGG15[1];
          strategies[1] = avGG15[2];
          strategies[2] = avGG15[0];
        }
      } else if (e.target.selectedIndex == 13) { //henchman hardcore
        deployments = [avDeps[3]]; // close dep
        strategies = [avStandard[0]]; // turf war
      }
      var deck = Malifaux.getShuffledDeck();
      var r, c, round, card;
      for (r = 0; r < this.roundList.length; ++r) {
        round = this.roundList.at(r);
        round.setDeployment(deployments[r % deployments.length]);
        round.setStrategy(strategies[r % strategies.length]);
        if (e.target.selectedIndex == 9) { //henchman hardcore
          round.setSchemes([Malifaux.getAvailableSchemes()[3]]); // assassinate
          continue;
        }
        var gg16 = (e.target.selectedIndex < 5);
        round.setSchemes([]);
        round.addAlwaysScheme(gg16);
        for (c = 0; c < 2; ++c) {
          card = deck.pop();
          if (card.indexOf("Joker") !== -1) {
            --c;
            continue;
          }
          card = card.split(' of ');
          round.addSchemeForCard(parseInt(card[0], 10), card[1], gg16);
        }
      }

    },

    showHelpCityFaction: function () {
      HelpTexts.showHelpText("cityFaction");
    },
    showHelpBye: function () {
      HelpTexts.showHelpText("bye,average-bye,gg14-bye");
    },
    showHelpRinger: function () {
      HelpTexts.showHelpText("ringer,competing-ringer,non-competing-ringer");
    },
    showHelpTournamentType: function () {
      HelpTexts.showHelpText("tournamentType,swiss,gg14-swiss");
    },
    showHelpGG14: function () {
      HelpTexts.showHelpText("gg14");
    },
    showHelpChooseFirstOpponent: function () {
      HelpTexts.showHelpText("chooseFirstOpponent");
    },
    showHelpRoundSettings: function () {
      HelpTexts.showHelpText("roundSettings");
    }
  });
  return SettingsView;
});