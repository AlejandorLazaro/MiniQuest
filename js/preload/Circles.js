// ©2012 Tangent 128.
// This script is provided without warranty as free software.
// It may be freely used, modified, and/or redistributed, so
// long as modified versions do not claim to be the original.

RufusLoader.Module("preload/Circles", [], function() {
	
	var Loader = function(tag) {
		this.tag = tag;
		this.cx = tag.getContext("2d");
		this.appletName = false;
	}
	Loader.prototype.testLoad = function() {
		
		if(this.appletName) {
			
			var applet = RufusLoader.ready(this.appletName);
			
			if(applet) {
				
				window.clearTimeout(this.timer);
				
				applet.init(this.tag);
				
				return true;
				
			}
			
		}
		
		return false;
		
	}
	Loader.prototype.draw = function() {
		
		if(this.testLoad()) return;
		
		var cx = this.cx;
		
		var t =(new Date()).getTime();
		t = (t % 1000) / 1000;
		
		cx.save();
			
			cx.translate(this.tag.width/2, this.tag.height/2);
			
			cx.clearRect(-30, -30, 60, 60);
			
			cx.rotate(Math.PI * 2 * t);
			
			cx.fillStyle = "#ff0000";
			cx.beginPath();
			cx.arc(0, 20, 6, 0, 7, false);
			cx.fill();
			
			cx.fillStyle = "#ffdd00";
			cx.beginPath();
			cx.arc(17.3, 10, 6, 0, 7, false);
			cx.fill();
			
			cx.fillStyle = "#00ff00";
			cx.beginPath();
			cx.arc(17.3, -10, 6, 0, 7, false);
			cx.fill();
			
			cx.fillStyle = "#00aaff";
			cx.beginPath();
			cx.arc(0, -20, 6, 0, 7, false);
			cx.fill();
			
		cx.restore();
		
	}
	
	this.init = function(tag) {
		
		var loader = new Loader(tag);
		
		var chainload = tag.getAttribute("data-chainload-applet");
		
		if(chainload) {
			loader.appletName = chainload;
		}
		
		loader.timer = window.setInterval(function() {
			loader.draw();
		}, 1000/30);
		
	}
	
});
