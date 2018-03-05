export default class RPNCalculatorModel {
  constructor() {    
    // 4 registers. if you want to change the number of registers, just change the length of this array
    // if you need more than 4 registers you want to go home and rethink your life
    this._stack = [0, 0, 0, 0];
    
    // the maximum digits that "getDisplay" should return
    this._maxDigits = 6;
    
    // used for tracking how the X register should react to number input
    this._lastAction = 'INPUT';
  }
  
  // accepts a string representing a button 
  buttonInput(buttonStr) {
    // is the string not a number? then it must be something else!
    if(isNaN(buttonStr)) {
      switch (buttonStr) {
        case 'BKSP':
          this.backspacePress();
          break;
        case 'ENTER':
          this.enterPress();
          break;
        case 'SWAP':
          this.swapPress();
          break;
        case 'DIVIDE':
        case 'MULTIPLY':
        case 'ADD':
        case 'SUBTRACT':
          this.operatorPress(buttonStr);
          break;
        case '.':
          this.pointPress();
          break;
        default:
          console.log(`Unsupported button: ${buttonStr}`);
      }
    } else { // if it was a number just do that
      this.numberPress(buttonStr);
    }    
  }
    
  numberPress(numberStr) {   
    this._clearIfNeeded();
    
    let xRegisterStr = this._stack[0].toString();
    
    if(this._lastAction == 'POINT')
      xRegisterStr += '.';
    
    xRegisterStr += numberStr; // append the string onto the buffer

    this._stack[0] = parseFloat(xRegisterStr);
    
    this._lastAction = 'INPUT';
  }
  
  pointPress() {
    this._clearIfNeeded();
    
    if(this._lastAction != 'POINT') {
      let xRegisterStr = this._stack[0].toString();
      
      if(xRegisterStr.indexOf('.') == -1)
        this._lastAction = 'POINT';
    }
  }
  
  swapPress() {
    let temp = this._stack[1];
    this._stack[1] = this._stack[0];
    this._stack[0] = temp;
  }
  
  backspacePress() {
    let residualPoint = false;
    
    // if the last thing the user did was press ENTER or use an OPERATOR,
    // then the backspace key should just clear the input
    if(this._lastAction == 'ENTER' || this._lastAction == 'OPERATOR' ) {
      this._stack[0] = 0;
    } else if(this._lastAction == 'POINT') {
      // points are lies
    } else {
      let xRegisterStr = this._stack[0].toString();
    
      if(xRegisterStr.length > 1) {
        xRegisterStr = xRegisterStr.substring(0, xRegisterStr.length - 1);
        
        // make backspace function properly with decimal signs
        if(xRegisterStr.slice(-1) == '.')
          residualPoint = true;
        
        this._stack[0] = parseFloat(xRegisterStr);
      } else {
        this._stack[0] = 0;
      }
    }
    this._lastAction = (residualPoint) ? 'POINT' : 'INPUT';
  }
  
  operatorPress(operatorStr) {
    // combine the first two registers
    switch(operatorStr) {
      case 'DIVIDE':
        this._stack[1] = this._stack[1] / this._stack[0];
        break;
      case 'MULTIPLY':
        this._stack[1] = this._stack[1] * this._stack[0];
        break;
      case 'ADD':
        this._stack[1] = this._stack[1] + this._stack[0];
        break;
      case 'SUBTRACT':
        this._stack[1] = this._stack[1] - this._stack[0];
        break;
    }
    
    // murder our old first register 
    this._stack.shift();
    
    // stick a zero back on the end to maintain length
    this._stack.push(0);
    
    this._lastAction = 'OPERATOR';
  }
  
  enterPress() {
    // push a copy of the current X register onto the front of our stack
    this._stack.unshift(this._stack[0]);
    
    // pop the old element off the end to maintain length
    this._stack.pop();
    
    this._lastAction = 'ENTER';
  }
  
  getDisplay() {
    let xRegisterStr = this._stack[0].toString()
    // TODO: make this react properly to long decimals
    if(xRegisterStr.length > this._maxDigits) {
      // if the display is too long we must take action
      
      //if the number doesn't fit because it's tiny or huge, use scientific notation
      // TODO: make this range dynamically calculated based on maxDigits
      if(this._stack[0] > 999999 || this._stack[0] < 0.00001) {
        let expNotation = this._stack[0].toExponential(1)
        return (expNotation.length < 8) ? expNotation : 'Error';
      } else {
        // otherwise, we assume that we just need to round it
        return this._stack[0].toPrecision(6);
      }
    } else {
      // if the display buffer is empty, show a zero
      if(this._lastAction == 'POINT')
        xRegisterStr += '.';
      
      return xRegisterStr;
    }
  }
  
  _clearIfNeeded() {
    // if an operator was pressed last, entering a number should shift the registers upward
    if(this._lastAction == 'OPERATOR') {
      this._stack.unshift(0);
      this._stack.pop();
    } else if(this._lastAction == 'ENTER') {
      this._stack[0] = 0;
    }
  }
}
