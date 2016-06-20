/** @flow */
'use strict';

import {expect} from 'chai';

import sinon from 'sinon';

import ContigInterval from '../../main/ContigInterval';
import ReferenceDataSource from '../../main/sources/ReferenceDataSource';
import RemoteFile from '../../main/RemoteFile';

describe('GA4GHDataSource', function() {
  var server: any = null, response;

  before(function () {
    return new RemoteFile('/test-data/reference-chrM-0-1000.json').getAllString().then(data => {
      response = data;
      server = sinon.fakeServer.create();  // _after_ we do a real XHR!
    });
  });

  after(function () {
    server.restore();
  });

  it('should fetch reference points from a server', function(done) {
    server.respondWith('POST', '/v0.5.1/reference/search',
                       [200, { "Content-Type": "application/json" }, response]);

    var source = ReferenceDataSource.create({
      url: 'reference',
      contigList: [{
        name:"chrM",
        length: 1000
      }]
    });

    var contig = new ContigInterval('chrM', 10, 20);
    var requestInterval = contig.toGenomeRange();
    expect(source.getRangeAsString(requestInterval))
        .to.deep.equal([]);

    var progress = [];
    source.on('networkprogress', e => { progress.push(e); });
    source.on('networkdone', e => { progress.push('done'); });
    source.on('newdata', () => {
      var reads = source.getRangeAsString(requestInterval);
      expect(reads).to.have.length(1);
      done();
    });

    source.rangeChanged({contig: 'chr17', start: 1, stop: 30});
    server.respond();
  });

});
