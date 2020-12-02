'use strict';

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var polyfill = getPolyfill();
var shim = require('./shim');

var define = require('define-properties');
var streamModule = require('stream');

/* eslint-disable no-unused-vars */
var boundFinished = function finished(stream, opts, callback) {
  /* eslint-enable no-unused-vars */
  return polyfill.apply(streamModule, arguments);
};
define(boundFinished, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = boundFinished;
