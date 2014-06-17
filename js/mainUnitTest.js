"use strict";
require.config({
  paths: {
    QUnit: 'libs/qunit-1.14.0',
    jquery: 'libs/jquery-1.11.1',
    underscore: 'libs/underscore-1.6.0',
    backbone: 'libs/backbone-1.1.2',
    localstorage: 'libs/backbone.localStorage-1.1.7',
  },
  shim: {
    QUnit: {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    } 
  }
});

// require the unit tests.
require([
  'QUnit',
  'unitTests/playerListTest',
  'unitTests/navigationViewTest',
  'unitTests/settingsViewTest',
  'unitTests/generateRoundTest',
],function(QUnit, playerListTest, navigationViewTest, settingsViewTest, generateRoundTest) {
  // run the tests.
  playerListTest.run();
  navigationViewTest.run();
  settingsViewTest.run();
  generateRoundTest.run();

  // start QUnit.
  QUnit.load();
  QUnit.start();
});
