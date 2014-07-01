"use strict";
define([
  'jquery',
], function($) {
  var HelpTexts = {

    cityFaction: "<h4>City/Club and Faction</h4>" +
      "If you fill these fields, players from the same city, "+
      "or playing the same faction, will not face each other in the first game, if possible.",

    bye: "<h4>Bye</h4>" +
      "If you have an uneven amount of players, a Bye will be automatically generated. " +
      "In the first round a random player will be matched against the bye. In the next rounds the player with the " +
      "lowest score, that has not already received a bye, will get the bye.",

    "average-bye": "<h5>Average Bye</h5>" +
      "Scoring against this bye will be an average of the other games by the player that was matched against the bye. " +
      "The first round (when there is no average), the player will get a temporary 0-0 draw.",

    "gg14-bye": "<h5>Gaining Grounds 2014 Bye</h5>" +
      "A player that receives the bye will score 3 TP, 10 VP and +5 VP diff.",

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
      "Each round each player will face an opponent with similar points, that has not been faced before. "+
      "See <a href='http://en.wikipedia.org/wiki/Swiss-system_tournament'>Wikipedia: Swiss-system tournament</a> for more details.",

    "gg14-swiss": "<h5>Gaining Grounds 2014 Swiss-like</h5>" +
      "Like the Swiss system, but players may face each other more than once, " +
      "if they have played at least two rounds against other opponents. "+
      "So a player may face the same person in round 1 and round 4.",

    showHelpText: function(tags) {
      var text = "";
      var tagArray = tags.split(',');
      for (var i = 0; i < tagArray.length; ++i) {
        console.log(tagArray[i]);
        text += this[tagArray[i]];
      }
      $("#help").html(text + "<hr/>");
    }

  };
  return HelpTexts;
});