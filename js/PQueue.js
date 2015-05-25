// ©2011 Tangent 128.
// This script is provided without warranty as free software.
// It may be freely used, modified, and/or redistributed, so
// long as modified versions do not claim to be the original.

RufusLoader.Module("PQueue", [], function() {
	
	// implements a min-heap priority queue
	// objects must have a "weight" field
	
	this.add = function(q, obj) {
		
		var n = q.length;
		
		q.push(obj);
		
		// bubble object up
		
		while(n > 0) {
			
			var child = q[n];
			
			var p = ((n+1) >> 1) - 1;
			
			var parent = q[p];
			
			if(child.weight < parent.weight) {
				
				q[n] = parent;
				q[p] = child;
				
				n = p;
				
			} else {
				break;
			}
			
		}
		
		
	}
	
	
	this.pop = function(q) {
		
		var result = q[0];
		
		// move last item to top
		
		q[0] = q[q.length - 1];
		
		q.length--;
		
		var p = 0;
		
		// allow item to bubble down while there are children
		
		while(p*2 + 1 < q.length) {
			
			var c1 = p*2 + 1;
			var c2 = p*2 + 2;
			
			var w1 = q[c1].weight;
			var w2 = c2 < q.length ? q[c2].weight : w1;
			
			var betterChildWeight = w1 < w2 ? w1 : w2;
			
			if(betterChildWeight < q[p].weight) {
				if(w1 == betterChildWeight) {
					var tmp = q[p];
					q[p] = q[c1];
					q[c1] = tmp;
					
					p = c1;
				} else {
					var tmp = q[p];
					q[p] = q[c2];
					q[c2] = tmp;
					
					p = c2;
				}
			} else {
				break;
			}
			
		}
		
		
		return result;
		
	}
	
	// debug
	
	this.init = function(tag) {
		
		var queue = [];
		
		this.add(queue, {weight: 4});
		this.add(queue, {weight: 1});
		this.add(queue, {weight: 3});
		this.add(queue, {weight: 77});
		this.add(queue, {weight: 33});
		this.add(queue, {weight: 9});
		this.add(queue, {weight: 8});
		this.add(queue, {weight: 8});
		this.add(queue, {weight: 1});
		this.add(queue, {weight: 3});
		
		while(queue.length > 0) {
			
			/*for(var i = 0; i < queue.length; i++) {
				tag.innerHTML += queue[i].weight + " "
			}*/
			
			tag.innerHTML += " " + this.pop(queue).weight + "<br/>";
			
		}
		
	}
	
});
