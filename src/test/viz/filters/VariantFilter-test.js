/* @flow */
'use strict';

import {expect} from 'chai';

import dataCanvas from 'data-canvas';
import filterUtils from '../../../main/viz/filters/filterUtils';
import type {VcfFilter} from '../../../main/viz/filters/VariantFilter';
import VariantFilter from '../../../main/viz/filters/VariantFilter';
import pileup from '../../../main/pileup';
import React from 'react';
import {waitFor} from '../../async';

describe('VariantFilter', function() {
  var didChange: boolean = false;

  // create SyntheticEvent
  var event = {
    cancelable: true,
    preventDefault: () => {},
    type: "test",
    bubbles: false,
    currentTarget: {},
    defaultPrevented: true,
    eventPhase: 0,
    isTrusted: true,
    nativeEvent: {},
    isDefaultPrevented: () => {},
    stopPropagation: () => {},
    isPropagationStopped: () => {},
    target: {},
    timeStamp: 0
  };

  var tracks = [
    {
      viz: pileup.viz.genome(),
      isReference: true,
      data: pileup.formats.twoBit({
        url: '/test-data/test.2bit'
      }),
      cssClass: 'a'
    },
    {
      viz: pileup.viz.variants(),
      data: pileup.formats.vcf({
        url: '/test-data/snv.chr17.vcf'
      }),
      cssClass: 'b'
    }
  ];

  var testDiv = document.getElementById('testdiv');

  beforeEach(() => {
    dataCanvas.RecordingContext.recordAll();  // record all data canvases
  });

  afterEach(function() {
    dataCanvas.RecordingContext.reset();
    testDiv.innerHTML = '';  // avoid pollution between tests.
  });

  function getProps(): Object {
    var vcfFilter: VcfFilter = filterUtils.initVariantFilters();

    var props = {
      filters: vcfFilter,
      onChange: function(filter: VcfFilter) {
        didChange = true;
      }
    };
    return props;
  }

  it('should render html', function(done) {
    var props = getProps();
    var filter: VariantFilter = new VariantFilter(props);
    var html = filter.render();
    expect(html.type).to.equal("form");
    done();
  });

  it('should trigger onchange', function(done) {
    var props = getProps();
    var filter: VariantFilter = new VariantFilter(props);
    filter.handleFilterSubmit(event);
    expect(didChange).to.equal(true);
    done();
  });

  it('should render variant filter', function() {
    this.timeout(5000);

    var div = document.createElement('div');
    div.setAttribute('style', 'width: 800px; height: 200px;');
    testDiv.appendChild(div);

    var p = pileup.create(div, {
      range: {contig: 'chr17', start: 100, stop: 150},
      tracks: tracks,
      filters: ["variants"]
    });

    var {drawnObjects, drawnObjectsWith, callsOf} = dataCanvas.RecordingContext;

    function hasCanvasAndObjects(div, selector) {
      return div.querySelector(selector + ' canvas') && drawnObjects(div, selector).length > 0;
    }

    var ready = (() =>
      hasCanvasAndObjects(div, '.reference') &&
      hasCanvasAndObjects(div, '.variants') &&
      hasCanvasAndObjects(div, '.vcfFilter') &&
      hasCanvasAndObjects(div, '.pileup')
    );
  });

});
