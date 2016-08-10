/**
 * Controls for filtering variants.
 * @flow
 */
'use strict';

import type {MenuItem} from '../../Menu';
import React from 'react';

type Props = {
  filters: VcfFilter;
  onChange: (filter: VcfFilter) => void;
};

export type VcfFilter = {
  transEffects: Array<MenuItem>;
  readDepth: number;
  alleleCount: number;
  alleleFreq: number;
}

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
  var readDepth = 0, alleleCount = 0, alleleFreq = 0;

  return {
    transEffects: transEffects,
    readDepth: readDepth,
    alleleCount: alleleCount,
    alleleFreq: alleleFreq
  };

}

class VariantFilter extends React.Component {
  props: Props;
  state: void;  // no state

  constructor(props: Object) {
    super(props);
  }

  handleFilterSubmit(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onChange(this.props.filters);
  }

  /*******************************************
  * Functions handling change in filter values
  *******************************************/

  transEffButtonClick(index: number){
    this.props.filters.transEffects[index].checked = true;
  }

  readDepthChange(e: SyntheticEvent){
    e.preventDefault();
    this.props.filters.readDepth = this.refs.readDepth;
  }

  alleleCountChange(e: SyntheticEvent){
    e.preventDefault();
    this.props.filters.alleleCount = this.refs.alleleCount;
  }

  alleleFreqChange(e: SyntheticEvent){
    e.preventDefault();
    this.props.filters.alleleFreq = this.refs.alleleFreq;
  }

  render(): any {
    var elems = [];

    var res = this.props.filters.transEffects.map((item, i)=>{
    	return <input ref="transEff" class ="transEff" type="checkbox" id={item.key} onClick = {this.transEffButtonClick.bind(i)}>{item.label}</input>;
    });

    elems.push(<div><h4>Transcript Effect</h4>{res}</div>);
    elems.push(<div><h4>Read Depth</h4><input  type="number"  min ="0" max ="200" id="readDepth"
				ref='readDepth' onChange={this.readDepthChange.bind(this)}></input></div>);
    elems.push(<div><h4>Allele Count</h4><input  type="number"  min ="0" max ="1000" step="100" id="alleleCount"
    			ref='alleleCount'  onChange={this.alleleCountChange.bind(this)}></input></div>);
    elems.push(<div><h4>Allele Frequency</h4><input type="text" id="freq"
    			readonly style="display:inline;background:#ccc;border:0;font-weight:bold; align:right;"
    			ref='alleleFreq'  onChange={this.alleleFreqChange.bind(this)}></input><div id="slider"></div></div>);
    elems.push(<button style="float:right" id = "submit"
    			onClick={this.handleFilterSubmit.bind(this)}>Submit</button>);
    return (
      <form className='vcfFilter' onSubmit={this.handleFilterSubmit.bind(this)}>
        elems
      </form>
    );
  }


}

module.exports = {
  initVariantFilters,
  VariantFilter
};
