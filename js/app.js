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
/*globals define*/
define([
  'router'
], function(Router) {
  "use strict";
  var initialize = function() {
  window.applicationCache.addEventListener('updateready', function() {
      if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          if (confirm('A new version of this site is available. Load it?')) {
            window.location.reload();
          }
      }
    }, false);

    Router.initialize();
  };

	return { initialize: initialize };
});