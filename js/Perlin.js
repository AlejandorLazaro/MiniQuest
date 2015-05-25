
RufusLoader.Module("Perlin", ["Chaos"], function(Chaos) {
	
	var VectorCount = 16;
	
	var vectorX = [];
	var vectorY = [];
	
	// generate initial vectors
	
	var rng = new Chaos.RNG(413);
	
	for(var i = 0; i < VectorCount; i++) {
		vectorX[i] = (rng.next(201) - 100) / 100;
	}
	
	rng.reset(612);
	
	for(var i = 0; i < VectorCount; i++) {
		vectorY[i] = (rng.next(201) - 100) / 100;
	}
	
	// normalize vectors
	
	for(var i = 0; i < VectorCount; i++) {
		var len = Math.sqrt(vectorX[i]*vectorX[i] + vectorY[i]*vectorY[i]);
		if(len == 0) {
			vectorX[i] = 0;
			vectorY[i] = 0;
		} else {
			vectorX[i] = vectorX[i] / len;
			vectorY[i] = vectorY[i] / len;
		}
	}
	
	// Perlin grid
	
	var Grid = this.Grid = function(seed, xSize, ySize) {
		
		this.seed = seed;
		this.w = xSize;
		this.h = ySize;
		
	}
	
	var influence = function(seed, bx, by, x, y) {
		var dx = x - bx;
		var dy = y - by;
		
		var vector = rng.reset(seed).seed(bx).seed(by).next(VectorCount);
		
		var dot = vectorX[vector]*dx + vectorY[vector]*dy;
		
		return dot;
		
	}
	
	var cubicInterpolate = function(a, b, i) {
		return a - (3*(i*i) - 2*(i*i*i))*(a-b);
	}
	
	Grid.prototype.value = function(x,y) {
		
		var seed = this.seed;
		
		// scale
		x /= this.w;
		y /= this.h;
		
		// get grid cell
		var bx = Math.floor(x);
		var by = Math.floor(y);
		
		// get influence values
		var ul = influence(seed, bx, by, x, y);
		var ur = influence(seed, bx+1, by, x, y);
		var bl = influence(seed, bx, by+1, x, y);
		var br = influence(seed, bx+1, by+1, x, y);
		
		var upper = cubicInterpolate(ul, ur, x-bx);
		var lower = cubicInterpolate(bl, br, x-bx);
		
		return cubicInterpolate(upper, lower, y-by);
		
	}
	
	// debug
	
	this.init = function(tag) {
		
		var perlin = new Grid(10, 0.5, 0.5);
		
		for(var y = 0; y < VectorCount; y++) {
			for(var x = 0; x < VectorCount; x++) {
				tag.innerHTML += ~~(perlin.value(x/VectorCount, y/VectorCount) * 10) + " ";
			}
			tag.innerHTML += "<br/>";
		}
		
		for(var i = 0; i < VectorCount; i++) {
			tag.innerHTML += vectorX[i] + " " + vectorY[i] + "<br/>";
		}
		
	}
	
});