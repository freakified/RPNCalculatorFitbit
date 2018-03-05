import document from 'document'

import Interactions from 'interactions'

import RPNCalculatorModel from 'rpncalculator'

let interactions = new Interactions();
let calc = new RPNCalculatorModel();

// document elements
const numberDisplayEl = document.getElementById("numberDisplay");

// on startup, make the calculator update the display
numberDisplayEl.text = calc.getDisplay();

// register event listener for button presses
interactions.onbuttonpress = (buttonStr) => {
  calc.buttonInput(buttonStr);
  numberDisplayEl.text = calc.getDisplay();
};