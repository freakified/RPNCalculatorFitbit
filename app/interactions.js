import document from 'document'

import { RPNKeypadLayout } from 'keypadlayouts'

export default class Interactions {
  constructor() {
    // In many cases, mouseup events will trigger even when the finger is still down.
    // To mitigate this, we ignore mouseup events if followed by subsequent mousemove events
    // within N milliseconds. 50 seems to be the lowest I can get away with using.
    this._mouseUpIgnoreDelay = 75;

    // lots and lots of pixel values
    this._screenW = 348;
    this._screenH = 250;
    this._buttonW = 64;
    this._buttonH = 57;
    this._edgeMarginX = 4;
    this._edgeMarginY = 5;
    this._buttonMarginX = 5;
    this._buttonMarginY = 4;
    this._activeEffectOffsetX = 93;
    this._activeEffectOffsetY = 96;
    this._activeEffectLabelOffsetY = 5;
    
    // eventually holds a reference to the touch end timeout delay
    this._touchEndTimeout = undefined;
    this._touchInProgress = false;

    // current touch position as grid coordinats
    this._gridX = undefined;
    this._gridY = undefined;
    
    // the three document elements that Interactions manipulates for visual feedback
    this._clickableAreaEl = document.getElementById('clickableArea');
    this._activeEffectEl = document.getElementById('activeEffect');
    this._activeEffectLabelEl = document.getElementById('activeEffectLabel');
    
    // we'll need to grab a reference to the display so we can do the "press preview" effect
    // disabled for now, touch glitches made it probably more annoying since you couldn't
    // tell if you got an erroneious double press
    // this._numberDisplayEl = document.getElementById('numberDisplay');
    
    // register requisite listeners
    this._clickableAreaEl.addEventListener('mousedown', (evt) => { this._touchStarted(evt); });
    this._clickableAreaEl.addEventListener('mouseup', (evt) => { this._touchEnded(evt); });
    this._clickableAreaEl.addEventListener('mousemove', (evt) => { this._touchChanged(evt); });
    
    // the function that will be called when a button is pressed
    this.onbuttonpress = undefined;
  }
  
  // "private" functions
  _updateActiveEffects() {
    // don't do anything if the touch was where the numeric display is
    if(this._gridX >= 3 && this._gridY == 0) {
      return;
    }
    
    // update the positions of the visual effects
    let xPos = this._edgeMarginX + this._gridX * this._buttonW + this._gridX * this._buttonMarginX;
    let yPos = this._edgeMarginY + this._gridY * this._buttonH + this._gridY * this._buttonMarginY;
    
    if(this._activeEffectEl) {
      this._activeEffectEl.x = xPos - this._activeEffectOffsetX;
      this._activeEffectEl.y = yPos - this._activeEffectOffsetY;
      this._activeEffectEl.style.visibility = 'visible';
    }
    
    if(this._activeEffectLabelEl) {
      this._activeEffectLabelEl.x = xPos;
      this._activeEffectLabelEl.y = yPos + this._activeEffectLabelOffsetY;
      this._activeEffectLabelEl.style.visibility = 'visible';
    }
    
    // do press preview effect
    //this._numberDisplayEl.style.opacity = 0.5;
    //this._numberDisplayEl.text = RPNKeypadLayout[this._gridY][this._gridX];
  }
  
  _touchStarted(evt) {
    this._gridX = Math.floor(evt.screenX / this._screenW * 5);
    this._gridY = Math.floor(evt.screenY / this._screenH * 4);
    
    this._updateActiveEffects();
    
    clearTimeout(this._touchEndTimeout);
    this._touchEndTimeout = setTimeout(() => { this._touchReallyEnded(); }, this._mouseUpIgnoreDelay);
    
    this._touchInProgress = true;
    //console.log("touchstarted!")
  }
  
  _touchEnded(evt) {
    // clearTimeout(this._touchEndTimeout);
    // this._touchEndTimeout = setTimeout(() => { this._touchReallyEnded(); }, this._mouseUpIgnoreDelay);
  }

  _touchChanged(evt) {
    if(this._touchInProgress === true) {
      this._gridX = Math.floor(evt.screenX / this._screenW * 5);
      this._gridY = Math.floor(evt.screenY / this._screenH * 4);

      this._updateActiveEffects();

      clearTimeout(this._touchEndTimeout);
      this._touchEndTimeout = setTimeout(() => { this._touchReallyEnded(); }, this._mouseUpIgnoreDelay);
    }
  }

  _touchReallyEnded() {
    this._activeEffectEl.style.visibility = 'hidden';
    this._activeEffectLabelEl.style.visibility = 'hidden';
    //this._numberDisplayEl.style.opacity = 1;

    // fire our "buttonpressed" event
    if(this.onbuttonpress) {
      this.onbuttonpress(RPNKeypadLayout[this._gridY][this._gridX]);
    }
    
    this._touchInProgress = false;
    
    //console.log("touchended!")
  }
};

