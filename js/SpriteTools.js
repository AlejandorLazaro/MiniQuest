// ©2012 Tangent 128.
// This script is provided without warranty as free software.
// It may be freely used, modified, and/or redistributed, so
// long as modified versions do not claim to be the original.


RufusLoader.Module("SpriteTools", [], function() {
	
	var undefined = void(0);
	
	/* 
	 * Sprite.pixelScale
	 * returns a canvas containing the source image/canvas image data,
	 * enlarged via pixel doubling/tripling/n-ing rather than interpolation.
	 * Intended to preserve a pixelly look, obviously.
	 */
	
	var pixelScale = this.pixelScale = function(src, factor) {
		
		var canvas = document.createElement("canvas");
		
		var w = canvas.width = src.width * factor;
		var h = canvas.height = src.height * factor;
		
		var cx = canvas.getContext("2d");
		
		cx.drawImage(src, 0, 0);
		
		var srcData = cx.getImageData(0,0, w,h);
		var newData = cx.createImageData(w, h);
		
		// calculate pixel scaling (no interpolation)
		
		var rows = newData.height;
		var cols = newData.width;
		var src = srcData.data;
		var data = newData.data;
		
		for(var y = 0; y < rows; y++) {
			for(var x = 0; x < cols; x++) {
				
				var base = (y*cols + x) * 4;
				var srcBase = (~~(y/factor)*cols + ~~(x/factor)) * 4;
				
				data[base] = src[srcBase];
				data[base+1] = src[srcBase+1];
				data[base+2] = src[srcBase+2];
				data[base+3] = src[srcBase+3];
				
			}
		}
		
		// put scaled value in
		cx.putImageData(newData, 0,0);
		
		return canvas;
		
	}
	
	/*
	 * Sprite
	 * 
	 * attributes for rendering an image
	 * 
	 */
	var Sprite = this.Sprite = function(x,y, spriteSheet, frame) {
		this.sheet = spriteSheet;
		this.frame = frame;
		this.x = x;
		this.y = y;
		this.visible = true;
	}
	
	
	/* 
	 * SpriteSheet
	 * 
	 */

	var SpriteSheet = this.SpriteSheet = function(image, w, h, cols, rows) {
		
		this.image = image;
		this.w = w;
		this.h = h;
		this.cols = cols;
		this.rows = rows;
		
	}
	SpriteSheet.prototype.paintFrame = function(cx, frameNum) {
		var x = (frameNum % this.cols) * this.w;
		var y = ~~(frameNum / this.cols) * this.h;
		cx.drawImage(this.image, x,y, this.w,this.h, 0,0, this.w,this.h);
	}
	SpriteSheet.prototype.frames = function() {
		return this.cols * this.rows;
	}
	// sprite factory method
	SpriteSheet.prototype.make = function(frame, x, y) {
		
		return new Sprite(x,y, this, frame);
		
	}
	
	/* 
	 * SpriteLayer
	 * 
	 * array of sprites on a parallax layer
	 * 
	 */
	
	var SpriteLayer = this.SpriteLayer = function(xPara, yPara, xWrap, yWrap) {
		
		this.xParallax = xPara;
		this.yParallax = yPara;
		if(this.xParallax == undefined) this.xParallax = 1;
		if(this.yParallax == undefined) this.yParallax = 1;
		
		this.xWrap = xWrap || false;
		this.yWrap = yWrap || false;
		
		this.sprites = [];
		
	}
	SpriteLayer.prototype.add = function(sprite) {
		this.sprites.push(sprite);
	}
	SpriteLayer.prototype.remove = function(sprite) {
		
		var i = this.sprites.indexOf(sprite);
		var l = this.sprites.length;
		
		if(i >= 0) {
			
			this.sprites[i] = this.sprites.pop();
			this.sprites.length = l - 1;
			
		}
	}
	SpriteLayer.prototype.paint = function(cx, bounds) {
		
		cx.save();
		
		var left = bounds.x * this.xParallax;
		var top = bounds.y * this.yParallax;
		
		if(this.xWrap) {
			left = left % this.xWrap;
			if(left < 0) left += this.xWrap;
		}
		if(this.yWrap) {
			top = top % this.yWrap;
			if(top < 0) top += this.yWrap;
		}
		
		var right = left + bounds.w;
		var bottom = top + bounds.h;
		
		cx.translate(-left, -top);
		
		for(var i = 0; i < this.sprites.length; i++) {
			
			var sprite = this.sprites[i];
			
			this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x, sprite.y);
			
			if(this.xWrap) {
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x - this.xWrap, sprite.y);
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x + this.xWrap, sprite.y);
			}
			if(this.yWrap) {
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x, sprite.y - this.yWrap);
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x, sprite.y + this.yWrap);
			}
			if(this.xWrap && this.yWrap) {
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x + this.xWrap, sprite.y + this.yWrap);
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x + this.xWrap, sprite.y - this.yWrap);
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x - this.xWrap, sprite.y + this.yWrap);
				this.paintSprite(cx, left, right, top, bottom, sprite, sprite.x - this.xWrap, sprite.y - this.yWrap);
			}
			
		}
		
		cx.restore();
	}
	SpriteLayer.prototype.paintSprite = function(cx, left, right, top, bottom, sprite, x, y) {
		
		// bounds cull
		if(sprite.visible) {
			if(x + sprite.sheet.w < left) {
				return;
			}
			if(x > right) {
				return;
			}
			if(y + sprite.sheet.h < top) {
				return;
			}
			if(y > bottom) {
				return;
			}
		} else {
			return;
		}
		
		// render
		cx.save();
			cx.translate(x, y);
			sprite.sheet.paintFrame(cx, sprite.frame);
		cx.restore();
		
	}
	
});
