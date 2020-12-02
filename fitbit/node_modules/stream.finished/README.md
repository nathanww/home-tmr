# stream.finished

<!-- markdownlint-disable MD013 -->
[![Build Status](https://secure.travis-ci.org/dex4er/js-stream.finished.svg)](http://travis-ci.org/dex4er/js-stream.finished) [![npm](https://img.shields.io/npm/v/stream.finished.svg)](https://www.npmjs.com/package/stream.finished)
<!-- markdownlint-enable MD013 -->

Polyfill for stream.finished in node versions &lt; v10

node v10.0.0 added support for a built-in `stream.finished`:
<https://github.com/nodejs/node/pull/19828>

This package provides the built-in
[`stream.finished`](https://nodejs.org/api/stream.html#stream_stream_finished_stream_callback)
in node v10.0.0 and later, and a replacement in other environments.

This package implements the [es-shim API](https://github.com/es-shims/api)
interface. It works in an ES3-supported environment and complies with the
[spec](http://www.ecma-international.org/ecma-262/6.0/).

## Installation

```shell
npm install stream.finished
```

_Additionally for Typescript:_

```shell
npm install -D @types/node
```

## Usage

### Direct

```js
const finished = require('stream.finished');
// Use `finished` just like the built-in method on `stream`
```

_Typescript:_

```ts
import finished from 'stream.finished';
// Use `finished` just like the built-in method on `stream`
```

### Shim

```js
require('stream.finished/shim')();
// `stream.finished` is now defined
const stream = require('stream');
// Use `stream.finished`
```

or:

```js
require('stream.finished/auto');
// `stream.finished` is now defined
const stream = require('stream');
// Use `stream.finished`
```

_Typescript:_

```js
import finishedShim from 'stream.finished/shim';
finishedShim();
// `stream.finished` is now defined
import stream from 'stream';
// Use `stream.finished`
```

or:

```js
import 'stream.finished/auto';
// `stream.finished` is now defined
import stream from 'stream';
// Use `stream.finished`
```

## License

Copyright (c) 2018-2019 Piotr Roszatycki <piotr.roszatycki@gmail.com>

Copyright Node.js contributors. All rights reserved.

Copyright (c) 2014 Mathias Buus

[MIT](https://opensource.org/licenses/MIT)
