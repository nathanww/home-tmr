'use strict';

var getPolyfill = require('./polyfill');

var define = require('define-properties');

var stream = require('stream');

module.exports = function shimStreamFinished() {
  var polyfill = getPolyfill();
  if (polyfill !== stream) {
    define(stream, {finished: polyfill}, {
      finished: function testFinished() {
        return stream.finished !== polyfill;
      }
    });
  }
  return polyfill;
};
