/// <reference types="node" />

import * as stream from 'stream';

declare function getPolyfill(): (
  stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream,
  callback: (err?: NodeJS.ErrnoException) => void
) => () => void;

export = getPolyfill;
