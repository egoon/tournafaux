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
    'jquery',
], function ($) {
    var HelpTexts = {

        cityFaction: "<h4>City/Club and Faction</h4>" +
        "If you fill these fields, players from the same city, " +
        "or playing the same faction, will not face each other in the first game, if possible.",

        gg14: "<h4>Gaining Grounds 2016</h4>" +
        "Check this to disable all options that are not compatible with " +
        "<a href='http://www.wyrd-games.net/s/Organized-Play-Formats.zip'>Gaining Grounds 2016</a>",

        chooseFirstOpponent: "<h4>Choose First Opponent</h4>" +
        "Check this if you wish to choose opponents for some or all players.",

        bye: "<h4>Bye</h4>" +
        "<p>If you have an uneven amount of players, a Bye will be automatically generated. " +
        "In the first round a random player will be matched against the bye. In the next rounds the player with the " +
        "lowest score, that has not already received a bye, will get the bye.</p>" +
        "<p>A player that recieves a bye will get 3TP, 10 VP and +5 Diff, but these values can be changed manually.</p>",

        ringer: "<h4>Ringer</h4>" +
        "A Ringer is a good friend or other person who agrees to step in and play, should the number " +
        "of players be uneven. And concede should the number of players even out again, due to disqualifications or " +
        "forfeits.",

        "competing-ringer": "<h5>Competing Ringer</h5>" +
        "A regular Ringer will, assuming she takes part of the entire tournament, " +
        "be treated and matched like a regular player.",

        "non-competing-ringer": "<h5>Non-Competing Ringer</h5>" +
        "If a tournaments organiser steps in as Ringer, she will not be part of " +
        "the final results, and will be matched like a bye.",

        tournamentType: "<h4>Tournament Type</h4>",

        swiss: "<h5>Swiss</h5>" +
        "A non-elimination tournament played over a number of rounds that may be fewer than the number of participants. " +
        "Each round each player will face an opponent with similar points, that has not been faced before. " +
        "See <a href='http://en.wikipedia.org/wiki/Swiss-system_tournament'>Wikipedia: Swiss-system tournament</a> for more details.",

        "gg14-swiss": "<h5>Gaining Grounds 2016 Swiss-like</h5>" +
        "Like the Swiss system, but players may face each other more than once, " +
        "if they have played at least two rounds against other opponents. " +
        "So a player may face the same person in round 1 and round 4.",

        disqualify: "<h4>Forfeits and Disqualifications</h4>" +
        "A player that is disqualified or forfeits will be removed from the standings table, and will not take part in future rounds. <br/>" +
        "If the player is 'removed now', they are removed from the current round, and the matching will change. <br/>" +
        "This will cause a bye or ringer to join or leave the tournament depending on the remaining amount of players.",

        roundSettings: "<h4>Round Settings</h4>" +
        "If you have a large screen or projector, you can add some information about the turns, that will be displayed in a separate window. " +
        "After generating the first round, a <strong>Round Info</strong> link will appear in the meny bar. " +
        "Click it to open the round info window, and move it to the player facing screen",

        switchingPlayers: "<h4>Switching Players</h4>" +
        "You can change the matching by dragging a player to a different table. The player you drop it on will then switch place with the dragged player.",

        showHelpText: function (tags) {
            var text = "";
            var tagArray = tags.split(',');
            for (var i = 0; i < tagArray.length; ++i) {
                console.log(tagArray[i]);
                text += this[tagArray[i]];
            }
            $("#help").html(text);
        }

    };
    return HelpTexts;
});