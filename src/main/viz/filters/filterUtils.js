/**
 * Grab-bag of utility functions.
 * @flow
 */
'use strict';

import type { VcfFilter } from './VariantFilter';

function initVariantFilters(): VcfFilter {

  var transEffects = [
    {key: "3P", label: '3 Prime UTR', checked: false},
    {key: "Intr", label: 'Intron', checked: false},
    {key: "5P", label: '5 Prime UTR', checked: false},
    {key: "Mis", label: 'Missense', checked: false},
    {key: "Cod", label: 'Coding', checked: false},
    {key: "Up", label: 'Upstream', checked: false},
    {key: "Down", label: 'Downstream', checked: false},
    {key: "Splice", label: 'Splice', checked: false}
  ];
  var readDepth = -1, alleleCount = -1, alleleFreq = -1;

  return {
    transEffects: transEffects,
    readDepth: readDepth,
    alleleCount: alleleCount,
    alleleFreq: alleleFreq
  };
}

function isValidFilter(vcfFilter: VcfFilter): boolean {
  return (vcfFilter.readDepth > 0 && vcfFilter.alleleCount > 0 && vcfFilter.alleleFreq > 0);
}

module.exports = {
  initVariantFilters,
  isValidFilter
};
