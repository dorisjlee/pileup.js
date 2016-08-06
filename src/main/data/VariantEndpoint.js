/**
 * This module defines a parser for the 2bit file format.
 * See http://genome.ucsc.edu/FAQ/FAQformat.html#format7
 * @flow
 */
'use strict';

import Q from 'q';
import ContigInterval from '../ContigInterval';
import type RemoteRequest from '../RemoteRequest';
import type {Variant} from './vcf';

class VariantEndpoint {
  remoteRequest: RemoteRequest;

  constructor(remoteRequest: RemoteRequest) {
    this.remoteRequest = remoteRequest;
  }

  getFeaturesInRange(range: ContigInterval<string>): Q.Promise<Variant[]> {

    return this.remoteRequest.get(range).then(object => {
      var d: Variant[] = object;
      return d;
    });
  }
}

module.exports = VariantEndpoint;
