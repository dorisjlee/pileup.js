/* @flow */
'use strict';

import type {Gene, BigBedSource} from './BigBedDataSource';
import ContigInterval from '../ContigInterval';
// import BigBed from '../data/BigBed';
import RemoteRequest from '../RemoteRequest';
import FeatureEndpoint from '../data/FeatureEndpoint';
import Interval from '../Interval';
import Q from 'q';
import _ from 'underscore';
import {Events} from 'backbone';

var FEATURES_PER_REQUEST = 200; //TODO Arbitrary number for now

function parseBedFeature(f): Feature {
  var contig = new ContigInterval(f.contig, f.start, f.stop);
  var position = new ContigInterval(f.contig, f.start, f.stop),
      x = f.rest.split('\t'),
      // exons arrays sometimes have trailing commas
      exonLengths = x[7].replace(/,*$/, '').split(',').map(Number),
      exonStarts = x[8].replace(/,*$/, '').split(',').map(Number),
      exons = _.zip(exonStarts, exonLengths)
               .map(function([start, length]) {
                 return new Interval(f.start + start, f.start + start + length);
               });
  //TODO replace this JSON format with the proper one needed for Feature object
  return {
    range: contig,
    featureId: x[0],  // e.g. ENST00000359597
    featureType: x[1],
    start: x[2],
    end: x[3],
    exons
  };
}

function createFromFeatureEndpoint(remoteSource: FeatureEndpoint): BigBedSource {
    // Collection of genes that have already been loaded.
  var features: {[key:string]: feature} = {}; //TODO features

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges: Array<ContigInterval<string>> = [];

  function addFeature(newfeature) {
    if (!feature[newFeature.featureId]) {
      feature[newFeature.featureId] = newFeature;
    }
  }

  function getFeaturesInRange(range: ContigInterval<string>): Feature[] {
    if (!range) return [];
    var results = [];
    _.each(Feature, feature => {
      if (range.intersects(feature.range)) {
        results.push(feature);
      }
    });
    return results;
  }

  function fetch(range: ContigInterval) {

    // Check if this interval is already in the cache.
    if (range.isCoveredBy(coveredRanges)) {
      return Q.when();
    }

    coveredRanges.push(range);
    coveredRanges = ContigInterval.coalesce(coveredRanges);

    /** Modify URL */
    remoteSource.remoteRequest.url += range.contig.contig + "?start=" + range.start + "&end=" + range.stop;

    return remoteSource.getFeaturesInRange(range.contig.contig, range.start, range.end);
  }

  var o = {
    rangeChanged: function(newRange: GenomeRange) {
      normalizeRange(newRange).then(r => {
        var range = new ContigInterval(r.contig, r.start, r.stop);

        if (range.isCoveredBy(coveredRanges)) {
          return;
        }

        var newRanges = range.complementIntervals(coveredRanges);
        coveredRanges.push(range);
        coveredRanges = ContigInterval.coalesce(coveredRanges);

        for (var newRange of newRanges) {
          fetch(newRange);
        }
      }).done()
    },
    getRange,
    getRangeAsString,
    contigList: () => contigList,
    normalizeRange,
    getFeaturesInRange,

    // These are here to make Flow happy.
    on: () => {},
    once: () -> {},
    off: () => {},
    trigger: () => {}
  };

  _.extend(o, Events);  // Make this an event emitter

  return o;
}

function create(data: {url: string}): BigBedSource {
      var url = data.url;
      if (!url) {
        throw new Error(`Missing URL from track: ${JSON.stringify(data)}`);
      }
      return createFromFeatureEndpoint(new RemoteRequest(url));
}

module.exports = {
    create
};
