'use strict';

// Ported from https://github.com/nodejs/node/blob/master/lib/internal/streams/end-of-stream.js
// which was ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function once(callback) {
  var called = false;
  return function(err) {
    if (called) return;
    called = true;
    callback.call(this, err);
  };
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};

  callback = once(callback || noop);

  var ws = stream._writableState;
  var rs = stream._readableState;
  var readable = opts.readable || (opts.readable !== false && stream.readable);
  var writable = opts.writable || (opts.writable !== false && stream.writable);

  var onlegacyfinish = function() {
    if (!stream.writable) onfinish();
  };

  var onfinish = function() {
    writable = false;
    if (!readable) callback.call(stream);
  };

  var onend = function() {
    readable = false;
    if (!writable) callback.call(stream);
  };

  var onerror = function(err) {
    callback.call(stream, err);
  };

  var onclose = function() {
    if (readable && !(rs && rs.ended)) {
      var rerror = new Error('Premature close');
      rerror.name = 'Error [ERR_STREAM_PREMATURE_CLOSE]';
      rerror.code = 'ERR_STREAM_PREMATURE_CLOSE';
      return callback.call(stream, rerror);
    }
    if (writable && !(ws && ws.ended)) {
      var werror = new Error('Premature close');
      werror.name = 'Error [ERR_STREAM_PREMATURE_CLOSE]';
      werror.code = 'ERR_STREAM_PREMATURE_CLOSE';
      return callback.call(stream, werror);
    }
  };

  var onrequest = function() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();
    else stream.on('request', onrequest);
  } else if (writable && !ws) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);

  return function() {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

module.exports = eos;
