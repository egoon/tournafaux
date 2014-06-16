"use strict";
require.config({
  paths: {
    QUnit: 'libs/qunit-1.14.0',
    jquery: '../js/libs/jquery-1.11.1',
    underscore: '../js/libs/underscore-1.6.0',
    backbone: '../js/libs/backbone-1.1.2',
    localstorage: '../js/libs/backbone.localStorage-1.1.7',
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
  'unitTests/navigationViewTest'
],function(QUnit, playerListTest, navigationViewTest) {
  // run the tests.
  playerListTest.run();
  navigationViewTest.run();

  // start QUnit.
  QUnit.load();
  QUnit.start();
});
