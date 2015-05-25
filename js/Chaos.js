
RufusLoader.Module("Chaos", [], function() {
	
	var FNV_INIT = 2166136261;
	
	var fnvRound = function(hash, data) {
		
		do {
			
			hash ^= data & 0xFF;
			
			hash *= 16777619;
			
			data = data >>> 8;
			
		} while(data != 0)
		
		return hash;
		
	}
	
	// suggestion from http://home.comcast.net/~bretm/hash/6.html
	var fnvFinish = function(hash) {
		hash += hash << 13;
		hash ^= hash >> 7;
		hash += hash << 3;
		hash ^= hash >> 17;
		hash += hash << 5;
		
		return hash;
	}
	
	// RNG ==================================
	
	var RNG = this.RNG = function(seed) {
		this.reset(seed);
	}
	RNG.prototype.reset = function(seed) {
		this.state = fnvRound(FNV_INIT, seed);
		this.count = 0;
		return this;
	}
	RNG.prototype.seed = function(seed) {
		this.state = fnvRound(this.state, seed);
		return this;
	}
	RNG.prototype.next = function(range) {
		
		this.state = fnvRound(this.state, this.count);
		
		this.count++;
		
		var r = fnvFinish(this.state);
		
		if(r >= 0) return r % range;
		else return (-r) % range;
	}
	
	// debug
	this.init = function(tag) {
		
		var rngA = new RNG(0);
		var rngB = new RNG(128);
		var rngX = (new RNG(1)).seed(128);
		
		for(var i = 0; i < 8; i++) {
			tag.innerHTML += rngA.next(7)+" "+rngB.next(7)+" "+rngX.next(7)+"<br/>";
		}
		
		rngA.reset(0);
		rngB.reset(128);
		rngX.reset(1).seed(128);
		
		for(var i = 0; i < 8; i++) {
			tag.innerHTML += rngA.next(7)+" "+rngB.next(7)+" "+rngX.next(7)+"<br/>";
		}
	}
	
});