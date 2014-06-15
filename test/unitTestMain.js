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
  'QUnit', 'unitTests/playerListTest'
],function(QUnit, playerListTest) {
  // run the tests.
  playerListTest.run();

  // start QUnit.
  QUnit.load();
  QUnit.start();
});
