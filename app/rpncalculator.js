export default class RPNCalculatorModel {
  constructor() {    
    // the top of the stack (the x register), is stored as a string so we can 
    // easily do things like backspace and "6.00"
    this._stackTop = '';
   
    // the rest of the stack (y, z, and t registers)
    this._stack = [0, 0, 0];
    
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
    
    this._stackTop += numberStr; // append the string onto the buffer
    
    this._lastAction = 'INPUT';
  }
  
  pointPress() {
    this._clearIfNeeded();
    
    if(this._stackTop == '') {
      this._stackTop = '0.';
      this._lastAction = 'INPUT';
    } else if(this._stackTop.indexOf('.') == -1) {
      this._stackTop += '.';
      this._lastAction = 'INPUT';
    }
  }
  
  swapPress() {
    let temp = this._stack[0];
    this._stack[0] = parseFloat(this._stackTop);
    this._stackTop = temp.toString();
  }
  
  backspacePress() {
    let residualPoint = false;
    
    // if the last thing the user did was press ENTER or use an OPERATOR,
    // then the backspace key should just clear the input
    if(this._lastAction == 'ENTER' || this._lastAction == 'OPERATOR' ) {
      this._stackTop = '';
    } else {
      if(this._stackTop.length > 1) {
        this._stackTop = this._stackTop.substring(0, this._stackTop.length - 1);
      } else {
        this._stackTop = 0;
      }
    }
    this._lastAction = 'INPUT';
  }
  
  operatorPress(operatorStr) {
    let stackTopFloat = parseFloat(this._stackTop);
    
    // combine the first two registers
    switch(operatorStr) {
      case 'DIVIDE':
        this._stack[0] = this._stack[0] / stackTopFloat;
        break;
      case 'MULTIPLY':
        this._stack[0] = this._stack[0] * stackTopFloat;
        break;
      case 'ADD':
        this._stack[0] = this._stack[0] + stackTopFloat;
        break;
      case 'SUBTRACT':
        this._stack[0] = this._stack[0] - stackTopFloat;
        break;
    }
        
    // set the top of the stack to our result
    this._stackTop = this._stack[0].toString()
    
    // shuffle the remaining registers over to removee the duplicate
    this._stack.shift();
    
    // stick a zero back on the end to maintain length
    this._stack.push(0);
    
    this._lastAction = 'OPERATOR';
  }
  
  enterPress() {
    // push a copy of the current X register onto the front of our stack
    this._stack.unshift(parseFloat(this._stackTop));
    
    // pop the old element off the end to maintain length
    this._stack.pop();
    
    // reformat the stack into a valid number
    this._stackTop = parseFloat(this._stackTop).toString();
    
    this._lastAction = 'ENTER';
  }
  
  getDisplay() {
    if(this._stackTop.length > this._maxDigits) {
      // if the display is too long we must take action
      
      let stackTopFloat = parseFloat(this._stackTop);
      
      //if the number doesn't fit because it's tiny or huge, use scientific notation
      // TODO: make this range dynamically calculated based on maxDigits
      if(this._stack[0] > 999999 || this._stack[0] < 0.00001) {
        let expNotation = stackTopFloat.toExponential(1)
        return (expNotation.length < 8) ? expNotation : 'Error';
      } else {
        // otherwise, we assume that we just need to round it
        return stackTopFloat.toPrecision(6);
      }
    } else {
      return (this._stackTop == '') ? '0' : this._stackTop;
    }
  }
  
  _clearIfNeeded() {
    if(this._lastAction == 'OPERATOR') {
      // if an operator was pressed last, entering a number should shift the registers upward
      this._stack.unshift(parseFloat(this._stackTop));
      this._stackTop = '';
      this._stack.pop();
    } else if(this._lastAction == 'ENTER') {
      // if ENTER was just pressed, entering a number should zero the x register
      this._stackTop = '';
    }
  }
}
