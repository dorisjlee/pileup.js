/**
 * Controls for filtering variants.
 * @flow
 */
'use strict';

import type {MenuItem} from '../../Menu';
import React from 'react';

type Props = {
  transEffects: Array<MenuItem|'-'>;
  readDepth: Number;
  alleleCount: Number; 
  alleleFreq: Number ;
  onChange: (filter: VarFilter)=>void;
};

type VarFilter = {
  transEffects: Array<MenuItem|'-'>;
  readDepth: Number;
  alleleCount: Number; 
  alleleFreq: Number ;
}

class VariantFilter extends React.Component {
  props: Props;
  state: void;  // no state

  constructor(props: Object) {
    super(props);
  }


  handleFilterChange(e: SyntheticEvent) {
    this.props.onChange(this.props({
    						transEffects: this.refs.transEff.value,
    						readDepth: this.refs.depth.value,
    						alleleCount: this.refs.count.value,
    						alleleFreq: this.refs.freq.value
    					}));
  }

  handleFilterSubmit(e: SyntheticEvent) {
    e.preventDefault();
    this.props.onChange(this.refs.value);
  }

  transEffButtonClick(item:string){
    this.props.transEffects.value.push({
			  key: item.key,
			  label: item.label,
			  checked: true
	}); 
  }

  render(): any {
    // var effectKeys = ["3P", "Intr","5P","Mis","Cod","Up","Down","Splice"];
    // var effectLabels = ["3 Prime UTR", "Intron","5 Prime UTR","Missense","Coding","Upstream","Downstream","Splice"];
    var elems = [];

    var res = this.props.transEffects.map((item,i)=>{
    	return <button ref="transEff" class ="transEff" type="button" id={item.key} onClick = {this.transEffButtonClick.bind(item)}>{item.label}</button>;
    });

    elems.push(<div><h4>Transcript Effect</h4>{res}</div>);
    elems.push(<div><h4>Read Depth</h4><input  type="number"  min ="0" max ="1000" step="100" id="depth" 
				ref='depth' onChange={this.handleFilterChange.bind(this)}></input></div>);
    elems.push(<div><h4>Allele Count</h4><input  type="number"  min ="0" max ="1000" step="100" id="count"
    			ref='count'  onChange={this.handleFilterChange.bind(this)}></input></div>);
    elems.push(<div><h4>Allele Frequency</h4><input type="text" id="freq" 
    			readonly style="display:inline;background:#ccc;border:0;font-weight:bold; align:right;"
    			ref='freq'  onChange={this.handleFilterChange.bind(this)}></input><div id="slider"></div></div>);
    elems.push(<button style="float:right" id = "submit" 
    			onClick={this.handleFilterSubmit.bind(this)}>Submit</button>);
    return elems;
  }


}

module.exports = VariantFilter;
