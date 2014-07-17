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
  'unitTests/roundViewTest',
],function(QUnit, playerListTest, navigationViewTest, settingsViewTest, generateRoundTest, roundViewTest) {
  // run the tests.
  playerListTest.run();
  navigationViewTest.run();
  settingsViewTest.run();
  generateRoundTest.run();
  roundViewTest.run();

  // start QUnit.
  QUnit.load();
  QUnit.start();
});
