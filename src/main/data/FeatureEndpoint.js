/**
 * This module defines a parser for features.
 * @flow
 */
'use strict';

import Q from 'q';
import ContigInterval from '../ContigInterval';
import type RemoteRequest from '../RemoteRequest';

export type Feature = {
  id: string;
  featureType: string;
  contig: string;
  start: number;
  stop: number;
}

class FeatureEndpoint {
  remoteRequest: RemoteRequest;

  constructor(remoteRequest: RemoteRequest) {
    this.remoteRequest = remoteRequest;
  }

  getFeaturesInRange(range: ContigInterval<string>): Q.Promise<Feature[]> {
    return this.remoteRequest.get(range).then(object => {
      var d: Feature[] = object;
      return d;
    });
  }
}

module.exports = FeatureEndpoint;
