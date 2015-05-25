// ©2011 Tangent 128.
// This script is provided without warranty as free software.
// It may be freely used, modified, and/or redistributed, so
// long as modified versions do not claim to be the original.

RufusLoader.Module("Keycontrol", [], function() {
	
	this.element = false;
	
	this.up = false;
	this.down = false;
	this.left = false;
	this.right = false;
	this.action = false;
	this.cancel = false;
	
	var self = this;
	
	this.init = function(element) {
		
		this.element = element;
		
		// keydown listener
		element.addEventListener("keydown", function(evt) {
			
			var handled = self.setState(evt.keyCode, true);
			
			if(handled) {
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			} else {
				return true;
			}
			
		}, true);
		
		// keyup listener
		element.addEventListener("keyup", function(evt) {
			
			var handled = self.setState(evt.keyCode, false);
			
			if(handled) {
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			} else {
				return true;
			}
			
		}, true);
		
	};
	
	this.addFocusGrabber = function(tag) {
		
		tag.addEventListener("click", function(){
			self.focus();
		}, false);
		
	}
	
	this.setState = function(code, state) {
		
		switch(code) {
			case 38: // up
				this.up = state;
				break;
			case 40: // down
				this.down = state;
				break;
			case 37: // left
				this.left = state;
				break;
			case 39: // right
				this.right = state;
				break;
			case 32: // action
				this.action = state;
				break;
			case 27: // cancel
				this.cancel = state;
				break;
			default:
				return false;
		}
		
		return true;
		
	};
	
	
	this.focus = function() {
		if(this.element) {
			this.element.focus();
		}
	};
	
});
