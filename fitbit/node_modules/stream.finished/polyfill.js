'use strict';

var implementation = require('./implementation');

var stream = require('stream');

module.exports = function getPolyfill() {
  if (typeof stream.finished === 'function') {
    return stream.finished;
  }
  return implementation;
};
