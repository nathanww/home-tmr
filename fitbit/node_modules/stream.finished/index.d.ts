/// <reference types="node" />

import * as stream from 'stream';

declare function finished(
  stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream,
  callback: (err?: NodeJS.ErrnoException | null) => void
): () => void;

declare namespace finished {
  function __promisify__(stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream): Promise<void>;
  function getPolyfill(): typeof finished;
  const implementation: typeof finished;
  function shim(): typeof finished;
}

export = finished;
