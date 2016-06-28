/**
<<<<<<< HEAD
 * RemoteRequest is used to for http requests on a remote server which can be
=======
 * RemoteFile is a representation of a file on a remote server which can be
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
 * fetched in chunks, e.g. using a Range request.
 * @flow
 */
'use strict';

import Q from 'q';

type Chunk = {
  start: number;
  stop: number;
<<<<<<< HEAD
  buffer: Object; // TODO: generalize to Any
}

// // Define transition from string json to array buffer
// function stringToBuffer(str: string): ArrayBuffer {
//   var buf = new ArrayBuffer(str.length); // 1 byte for each char
//   var bufView = new Uint8Array(buf);
//   for (var i=0, strLen=str.length; i<strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return buf;
// }

=======
  buffer: ArrayBuffer; // TODO: generalize to Any
}

// Define transition from json to object in
function stringToBuffer(str: string): ArrayBuffer {
  var buf = new ArrayBuffer(str.length); // 1 byte for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc

class RemoteRequest {
  url: string;
  chunks: Array<Chunk>;  // regions of file that have already been loaded.
  numNetworkRequests: number;  // track this for debugging/testing

<<<<<<< HEAD
  constructor(url: string, key: string) {
    this.url = url;
    this.chunks = [];
    this.key = key;
    this.numNetworkRequests = 0;
  }

  get(contig: string, start: number, stop: number): Q.Promise<Object> {
=======
  constructor(url: string) {
    this.url = url;
    this.chunks = [];
    this.numNetworkRequests = 0;
  }

  get(contig: string, start: number, stop: number): Q.Promise<ArrayBuffer> {
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
    var length = stop - start;
    if (length <= 0) {
      return Q.reject(`Requested <0 bytes (${length}) from ${this.url}`);
    }

    // First check the cache.
    var buf = this.getFromCache(start, stop);
    if (buf) {
      return Q.when(buf);
    }

    // Need to fetch from the network.
    return this.getFromNetwork(contig, start, stop);
  }

<<<<<<< HEAD
  getFromCache(start: number, stop: number): ?Object {
=======
  getFromCache(start: number, stop: number): ?ArrayBuffer {
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
    for (var i = 0; i < this.chunks.length; i++) {
      var chunk = this.chunks[i];
      if (chunk.start <= start && chunk.stop >= stop) {
        return chunk.buffer.slice(start - chunk.start, stop - chunk.start + 1);
      }
    }
    return null;
  }

    /**
     * Request must be of form "url/contig?start=start&end=stop"
    */
<<<<<<< HEAD
  getFromNetwork(contig: string, start: number, stop: number): Q.Promise<Object> {
=======
  getFromNetwork(contig: string, start: number, stop: number): Q.Promise<ArrayBuffer> {
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
    var length = stop - start;
    if (length > 50000000) {
      throw `Monster request: Won't fetch ${length} bytes from ${this.url}`;
    }

    var xhr = new XMLHttpRequest();
<<<<<<< HEAD
    var endpoint = this.url + "/" + contig + "?start=" + start + "&end=" + stop + "&key=" + this.key;
=======
    var endpoint = this.url + "/" + contig + "?start=" + start + "&end=" + stop;
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
    xhr.open('GET', endpoint);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    return this.promiseXHR(xhr).then(json => {
      // extract response from promise
<<<<<<< HEAD
      var response = json[0]; // TODO: don't store in object

      // var buffer = stringToBuffer(response);

      // The actual length of the response may be less than requested if it's
      // too short, e.g. if we request bytes 0-1000 of a 500-byte file.
      var newChunk = { start, stop, response};
      this.chunks.push(newChunk);
      return response;
=======
      var response = json[0];
      var buffer = stringToBuffer(response);
      // The actual length of the response may be less than requested if it's
      // too short, e.g. if we request bytes 0-1000 of a 500-byte file.
      var newChunk = { start, stop, buffer};
      this.chunks.push(newChunk);
      return buffer;
>>>>>>> 849521832fe21daaee957c6aa6f4bcf9020e95bc
    });
  }

  // Wrapper to convert XHRs to Promises.
  // The promised values are the response (e.g. an ArrayBuffer) and the Event.
  promiseXHR(xhr: XMLHttpRequest): Q.Promise<[any, Event]> {
    var url = this.url;
    var deferred = Q.defer();
    xhr.addEventListener('load', function(e) {
      if (this.status >= 400) {
        deferred.reject(`Request for ${url} failed with status: ${this.status} ${this.statusText}`);
      } else {
        deferred.resolve([this.response, e]);
      }
    });
    xhr.addEventListener('error', function(e) {
      deferred.reject(`Request for ${url} failed with status: ${this.status} ${this.statusText}`);
    });
    this.numNetworkRequests++;
    xhr.send();
    return deferred.promise;
  }

  // Attempting to access Content-Range directly may raise security errors.
  // This ensures the access is safe before making it.
  _getLengthFromContentRange(xhr: XMLHttpRequest): ?number {
    if (!/Content-Range/i.exec(xhr.getAllResponseHeaders())) {
      return null;
    }

    var contentRange = xhr.getResponseHeader('Content-Range');
    var m = /\/(\d+)$/.exec(contentRange);
    if (m) {
      return Number(m[1]);
    }
    console.warn(`Received improper Content-Range value for ` +
                 `${this.url}: ${contentRange}`);
    return null;
  }

  clearCache() {
    this.chunks = [];
  }
}

module.exports = RemoteRequest;
