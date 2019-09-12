import React from 'react';
// VARS:
const isOperator = /[x/+‑]/,endsWithOperator = /[x+‑/]$/,equalsOperator= /[=]/;
class Calculator extends React.Component{
 constructor(props){
	super(props);
	this.state = {
	    currentVal : '0',
		prevVal : '0',
        formula : '',
        currentSign: 'pos',
        lastClicked: ''		
	}
    this.handleNumbers = this.handleNumbers.bind(this);
    this.maxDigitWarning = this.maxDigitWarning.bind(this);
    this.handleCE = this.handleCE.bind(this);
    this.handleOperators = this.handleOperators.bind(this);
    this.lockOperators = this.lockOperators.bind(this);
	this.handleEvaluate = this.handleEvaluate.bind(this);
	this.initialize = this.initialize.bind(this);
	this.handleDecimal = this.handleDecimal.bind(this);
	this.handleToggleSign = this.handleToggleSign.bind(this);
	this.toggleToPositive = this.toggleToPositive.bind(this);
	this.toggleToNegative = this.toggleToNegative.bind(this);
	
 }
 maxDigitWarning() {
    this.setState({
        currentVal: 'Digit Limit Met',
        prevVal: this.state.currentVal
    });
    setTimeout(() => this.setState({ currentVal: this.state.prevVal }), 1000);
 }
 
 handleNumbers(e){
	if(!this.state.currentVal.includes('Limit')) {		
        const {currentVal, formula, evaluated} = this.state;		
        const value = e.target.value;
        this.setState({evaluated: false});
        if(currentVal.length > 18) {
            this.maxDigitWarning();
        }else if(evaluated) {
            this.setState({
                currentVal: value,
                formula: value !== '0' ? value : ''
            });
        }else{
            this.setState({
                currentVal: currentVal === '0' || isOperator.test(currentVal) ? value: currentVal + value,
                formula:  currentVal === '0' && value === '0' ? formula : (/([^.0-9]0)$/).test(formula) ? formula.slice(0, -1) + value : formula + value
            });
        }
    }
	 
 }
 
 handleCE() {
    let thisWith = new RegExp(/[x+‑\/]$|\d+\.?\d*$|(\(-\d+\.?\d*)$|(\(-)$|\)[x+‑\/]$/);
	if (this.state.formula.indexOf('=') != -1) {
      this.initialize();
    } else {
      this.setState({
        formula: this.state.formula.replace(thisWith, ''),
        currentVal: '0',
        lastClicked: 'CE',
      });
    }
    setTimeout(() => {
      this.setState({
        currentSign: this.state.formula === '' ||
          endsWithOperator.test(this.state.formula) ||
          this.state.formula.match(/(\(?-?\d+\.?\d*)$/)[0].indexOf('-') == -1 ?
          'pos' : 'neg'
      });
    }, 100);
  }  
 
 handleEvaluate() {
    if(!this.lockOperators(this.state.formula, this.state.currentVal)) {
        let expression = this.state.formula;
		
        if(endsWithOperator.test(expression)) 
		expression = expression.slice(0, -1);
        expression = expression.replace(/x/g, "*").replace(/‑/g, "-");
        expression = expression.lastIndexOf('(') > expression.lastIndexOf(')') ?
        expression + ')' : expression;
        
        if(!equalsOperator.test(expression)){
			let answer = Math.round(1000000000000 * eval(expression)) / 1000000000000;
            this.setState({
            currentVal: answer.toString(),
            formula: expression.replace(/\*/g, '⋅').replace(/-/g, '‑') + '=' + answer,
            prevVal: answer,
            currentSign: answer[0] == '-' ? 'neg' : 'pos',
            lastClicked: 'evaluated'
        });
		}	
		
    }
 } 
 
 lockOperators(formula, currentVal) {
	
    return formula.lastIndexOf('.') == formula.length - 1 ||
      formula.lastIndexOf('-') == formula.length - 1 || currentVal.indexOf('Met') != -1
 } 
  
 handleOperators(e){
	if(!this.lockOperators(this.state.formula, this.state.currentVal)) {
        if(this.state.formula.lastIndexOf('(') > this.state.formula.lastIndexOf(')')){
            this.setState({
                formula: this.state.formula + ')' + e.target.value,
                prevVal: this.state.formula + ')'
            });
        }else if (this.state.formula.indexOf('=') != -1) {
            this.setState({
                formula: this.state.prevVal + e.target.value
            }); // comment 1
        }else {
            this.setState({ // comment 2
                prevVal: !isOperator.test(this.state.currentVal) ? this.state.formula : this.state.prevVal,
                formula: !isOperator.test(this.state.currentVal) ? this.state.formula += e.target.value : this.state.prevVal += e.target.value
            });
        } // operator defaults:
        
		this.setState({ 
		            currentSign: 'pos',
		            currentVal: e.target.value,
                    lastClicked: 'operator'
        });
    }  
  }
  
  initialize() {
    this.setState({
      currentVal: '0',
      prevVal: '0',
      formula: '',
      currentSign: 'pos',
      lastClicked: '',
      evaluated: false
    });
  }
  handleDecimal() {
    if (this.state.currentVal.indexOf('.') == -1 &&
      this.state.currentVal.indexOf('Limit') == -1) {
      this.setState({
          lastClicked: this.state.lastClicked == 'CE' ? 'CE' : 'decimal'
        }) // comment 4
      if (this.state.currentVal.length > 21) {
        this.maxDigitWarning();
      } else if (this.state.lastClicked == 'evaluated' ||
        endsWithOperator.test(this.state.formula) ||
        this.state.currentVal == '0' && this.state.formula === '' ||
        /-$/.test(this.state.formula)) {
        this.setState({
          currentVal: '0.',
          formula: this.state.lastClicked == 'evaluated' ? '0.' : this.state.formula + '0.'
        });
      } else if (this.state.formula.match(/(\(?\d+\.?\d*)$/)[0].indexOf('.') > -1) { // comment 5
      } else {
        this.setState({
          currentVal: this.state.formula.match(/(-?\d+\.?\d*)$/)[0] + '.',
          formula: this.state.formula + '.',
        })
      }
    }
  }
  handleToggleSign() {
    this.setState({
      lastClicked: 'toggleSign'
    });
	
    if(this.state.lastClicked == 'evaluated') { 
      this.setState({
        currentVal :  this.state.currentVal.indexOf('-') > -1 ? this.state.currentVal.slice(1) : '-' + this.state.currentVal,
        formula    :  this.state.currentVal.indexOf('-') > -1 ? this.state.currentVal.slice(1) : '(-' + this.state.currentVal,
        currentSign:  this.state.currentVal.indexOf('-') > -1 ? 'pos' : 'neg',
      });
    }else if(this.state.currentSign == 'neg') {
      this.toggleToPositive(this.state.formula,this.state.formula.lastIndexOf('(-'),this.state.currentVal)
    }else {
      this.toggleToNegative(this.state.formula,this.state.currentVal)
    }
  }
  
  toggleToNegative(formula, currentVal) {
    this.setState({
      currentVal: '-' + this.state.formula.match(/(\d*\.?\d*)$/)[0],
      formula: formula.replace(/(\d*\.?\d*)$/,
        '(-' + this.state.formula.match(/(\d*\.?\d*)$/)[0]),
      currentSign: 'neg'
    });
  }
  
  toggleToPositive(formula, lastOpen, currentVal) {
    this.setState({
      currentSign: 'pos'
    });
    if (this.state.lastClicked == 'CE') {
      this.setState({
        currentVal: this.state.formula.match(/(\d+\.?\d*)$/)[0],
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen + 2),
      });
    } else if (currentVal == '-') {
      this.setState({
        currentVal: '0',
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen + 2),
      });
    } else {
      this.setState({
        currentVal: currentVal.slice(currentVal.indexOf('-') + 1),
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen + 2),
      });
    }
  }

 
  render(){
    return(
        <div className='calculator'>
			<Formula formula={this.state.formula.replace(/x/g, '⋅')} />
			<Output currentValue={this.state.currentVal} />
			<Buttons numbers={this.handleNumbers} handleCE={this.handleCE} handleOperators={this.handleOperators}
                     handleEval={this.handleEvaluate} init={this.initialize} handleDecimal={this.handleDecimal}  handleToggleSign={this.handleToggleSign}  />
		</div>
    );
  }
}

class Buttons extends React.Component{
	
  render(){
	return(
	    <div>
		    <button value='C' onClick={this.props.init} >C</button>
            <button value='CE' onClick={this.props.handleCE} >CE</button>
			<button value='±' onClick={this.props.handleToggleSign} >±</button>
            <button value='/' onClick={this.props.handleOperators} >/</button>
            <button value='7' onClick={this.props.numbers} className="buttonNumbers" >7</button>
			<button value='8' onClick={this.props.numbers} className="buttonNumbers" >8</button>
			<button value='9' onClick={this.props.numbers} className="buttonNumbers" >9</button>
			<button value='x' onClick={this.props.handleOperators} >x</button>
			<button value='4' onClick={this.props.numbers} className="buttonNumbers" >4</button>
			<button value='5' onClick={this.props.numbers} className="buttonNumbers" >5</button>
			<button value='6' onClick={this.props.numbers} className="buttonNumbers" >6</button>
			<button value='‑' onClick={this.props.handleOperators} >‑</button>
			<button value='1' onClick={this.props.numbers} className="buttonNumbers" >1</button>
			<button value='2' onClick={this.props.numbers} className="buttonNumbers" >2</button>
			<button value='3' onClick={this.props.numbers} className="buttonNumbers" >3</button>
			<button value='+' onClick={this.props.handleOperators} >+</button>
			<button value='.' onClick={this.props.handleDecimal}>.</button>
			<button value='0' onClick={this.props.numbers} className="buttonNumbers" >0</button>			
			<button value='=' onClick={this.props.handleEval} className="equals" >=</button>
		</div>
	);
  }
}

const Output = props => {
	return <div className='outputScreen' id='display'>{props.currentValue}</div>
}

const Formula = props => {
	
   return <div className='formulaScreen'>{props.formula}</div>;
}


export default Calculator;
