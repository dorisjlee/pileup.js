/**
 * The "glue" between TwoBit.js and GenomeTrack.js.
 *
 * GenomeTrack is pure view code -- it renders data which is already in-memory
 * in the browser.
 *
 * TwoBit is purely for data parsing and fetching. It only knows how to return
 * promises for various genome features.
 *
 * This code acts as a bridge between the two. It maintains a local version of
 * the data, fetching remote data and informing the view when it becomes
 * available.
 *
 * @flow
 */
'use strict';

import Q from 'q';
import _ from 'underscore';
import {Events} from 'backbone';

import RemoteRequest from '../RemoteRequest';
import ContigInterval from '../ContigInterval';
import Sequence from '../data/Sequence';
import SequenceStore from '../SequenceStore';
import utils from '../utils';


// Requests for 2bit ranges are expanded to begin & end at multiples of this
// constant. Doing this means that panning typically won't require
// additional network requests.
var BASE_PAIRS_PER_FETCH = 10000;

var MAX_BASE_PAIRS_TO_FETCH = 100000;


// Flow type for export.
export type ReferenceSource = {
  rangeChanged: (newRange: GenomeRange) => void;
  getRange: (range: GenomeRange) => {[key:string]: ?string};
  getRangeAsString: (range: GenomeRange) => string;
  contigList: () => string[];
  normalizeRange: (range: GenomeRange) => Q.Promise<GenomeRange>;
  on: (event: string, handler: Function) => void;
  once: (event: string, handler: Function) => void;
  off: (event: string) => void;
  trigger: (event: string, ...args:any) => void;
}

// Expand range to begin and end on multiples of BASE_PAIRS_PER_FETCH.
function expandRange(range) {
  var roundDown = x => x - x % BASE_PAIRS_PER_FETCH;
  var newStart = Math.max(0, roundDown(range.start())),
      newStop = roundDown(range.stop() + BASE_PAIRS_PER_FETCH - 1);

  return new ContigInterval(range.contig, newStart, newStop);
}


var createFromReferenceUrl = function(remoteRequest: Sequence): ReferenceSource {
  // Local cache of genomic data.
  // Fetch the contig list immediately.
  var contigList = remoteRequest.getContigList();
  o.trigger('contigs', contigList);

  var store = new SequenceStore();

  // Ranges for which we have complete information -- no need to hit network.
  var coveredRanges = ([]: ContigInterval<string>[]);


  function fetch(range: ContigInterval) {
    var span = range.length();
    if (span > MAX_BASE_PAIRS_TO_FETCH) {
      return Q.when();  // empty promise
    }

    console.log(`Fetching ${span} base pairs`);
    remoteRequest.getFeaturesInRange(range.contig, range.start(), range.stop())
      .then(letters => {
        if (!letters) return;
        if (letters.length < range.length()) {
          // Probably at EOF
          range = new ContigInterval(range.contig,
                                     range.start(),
                                     range.start() + letters.length - 1);
        }
        store.setRange(range, letters);
      }).then(() => {
        o.trigger('newdata', range);
      }).done();
  }

    function normalizeRange(range: GenomeRange): Q.Promise<GenomeRange> {
      return normalizeRangeSync(range);
    }

    // Returns a {"chr12:123" -> "[ATCG]"} mapping for the range.
    function getRange(range: GenomeRange) {
      return store.getAsObjects(ContigInterval.fromGenomeRange(range));
    }

    // Returns a string of base pairs for this range.
    function getRangeAsString(range: GenomeRange): string {
      if (!range) return '';
      return store.getAsString(ContigInterval.fromGenomeRange(range));
    }

   // This either adds or removes a 'chr' as needed.
    function normalizeRangeSync(range: GenomeRange): GenomeRange {
      if (contigList.indexOf(range.contig) >= 0) {
        return range;
      }
      var altContig = utils.altContigName(range.contig);
      if (contigList.indexOf(altContig) >= 0) {
        return {
          contig: altContig,
          start: range.start,
          stop: range.stop
        };
      }
      return range;  // let it fail with the original contig
    }

  var o = {
    // The range here is 0-based, inclusive
    rangeChanged: function(newRange: GenomeRange) {
      normalizeRange(newRange).then(r => {
        var range = new ContigInterval(r.contig, r.start, r.stop);

        // Check if this interval is already in the cache.
        if (range.isCoveredBy(coveredRanges)) {
          return;
        }

        range = expandRange(range);
        var newRanges = range.complementIntervals(coveredRanges);
        coveredRanges.push(range);
        coveredRanges = ContigInterval.coalesce(coveredRanges);

        for (var newRange of newRanges) {
          fetch(newRange);
        }
      }).done();
    },
    // The ranges passed to these methods are 0-based
    getRange,
    getRangeAsString,
    contigList: () => contigList,
    normalizeRange,

    // These are here to make Flow happy.
    on: () => {},
    once: () => {},
    off: () => {},
    trigger: () => {}
  };
  _.extend(o, Events);  // Make this an event emitter

  return o;
};

function create(data: {prefix:string, contigList: string[]}): ReferenceSource {
  var urlPrefix = data.prefix;
  var contigList = data.contigList;

  // verify data was correctly set
  if (!urlPrefix) {
    throw new Error(`Missing URL from track: ${JSON.stringify(data)}`);
  }
  if (!contigList) {
    throw new Error(`Missing Contig List from track: ${JSON.stringify(data)}`);
  }

  // create request with url prefix
  var remoteRequest= new RemoteRequest(urlPrefix);
  var sequence = new Sequence(remoteRequest, contigList);

  return createFromReferenceUrl(sequence);
}

module.exports = {
  create,
  createFromReferenceUrl
};
