/* @flow */
'use strict';

import {expect} from 'chai';

import Sequence from '../../main/data/Sequence';
import ReferenceDataSource from '../../main/sources/ReferenceDataSource';
import TwoBitDataSource from '../../main/sources/TwoBitDataSource';
import RemoteRequest from '../../main/RemoteRequest';

describe('ReferenceDataSource', function() {
  function getTestSource() {
    var contigList = null; // TODO
    var s = new Sequence(new RemoteRequest('/reference'), contigList);
    return ReferenceDataSource.createFromReferenceUrl(s);
  }

  var origBasePairsToFetch;
  beforeEach(function() {
    origBasePairsToFetch = TwoBitDataSource.testBasePairsToFetch();
  });
  afterEach(function() {
    TwoBitDataSource.testBasePairsToFetch(origBasePairsToFetch);
  });

  it('should fetch contigs', function(done) {
    var source = getTestSource();
    source.on('contigs', contigs => {
      expect(contigs).to.deep.equal(['chr1', 'chr17', 'chr22']);
      done();
    });
  });

  it('should fetch base pairs', function(done) {
    var source = getTestSource();
    var range = {contig: 'chr22', start: 0, stop: 3};

    // Before data has been fetched, all base pairs are null.
    expect(source.getRange(range)).to.deep.equal({
      'chr22:0': null,
      'chr22:1': null,
      'chr22:2': null,
      'chr22:3': null
    });
    expect(source.getRangeAsString(range)).to.equal('....');

    source.on('newdata', () => {
      expect(source.getRange(range)).to.deep.equal({
        'chr22:0': 'N',
        'chr22:1': 'T',
        'chr22:2': 'C',
        'chr22:3': 'A'
      });
      expect(source.getRangeAsString(range)).to.equal('NTCA');
      done();
    });
    source.rangeChanged(range);
  });

  it('should fetch nearby base pairs', function(done) {
    var source = getTestSource();

    source.on('newdata', () => {
      expect(source.getRange({contig: 'chr22', start: 0, stop: 14}))
          .to.deep.equal({
            'chr22:0':  'N',
            'chr22:1':  'T',
            'chr22:2':  'C',
            'chr22:3':  'A',
            'chr22:4':  'C',  // start of actual request
            'chr22:5':  'A',
            'chr22:6':  'G',
            'chr22:7':  'A',
            'chr22:8':  'T',
            'chr22:9':  'C',  // end of actual requuest
            'chr22:10': 'A',
            'chr22:11': 'C',
            'chr22:12': 'C',
            'chr22:13': 'A',
            'chr22:14': 'T'
          });
      done();
    });
    source.rangeChanged({contig: 'chr22', start: 4, stop: 9});
  });

  it('should not fetch data twice', function(done) {
        // TODO
  });

  it('should add chr', function(done) {
        // TODO
  });

  it('should allow a mix of chr and non-chr', function(done) {
        // TODO
  });

  it('should only report newly-fetched ranges', function(done) {
        // TODO
  });
});
