
RufusLoader.Module("World", ["Perlin", "Chaos", "PQueue", "SpriteTools", "img/TileTextures.png", "MapItems"], function(Perlin, Chaos, PQueue, SpriteTools, TileTextures, MapItems) {
	
	// Biomes
	var NONE 	= this.NONE = -1;
	var CASTLE 	= this.CASTLE = 0;
	var MOUNTAIN 	= this.MOUNTAIN = 1;
	var DARK_FOREST 	= this.DARK_FOREST = 2;
	var BEACH 	= this.BEACH = 3;
	var DESERT 	= this.DESERT = 4;
	var RESERVED 	= this.RESERVED = 5;
		// cost 1000 = castle, cost 2 = sky, cost 3 = cloud
	
	// Sprites
	var tileSheet = new SpriteTools.SpriteSheet(TileTextures, 10, 10, 22, 1);
	
	var GRASS = 0;
	var POND = 1;
	var ROCK = 2;
	var SAND = 3;
	var ROCK_FLOOR = 4;
	var DESERT_SAND = 5;
	var MOUNTAIN_DIRT = 6;
	var OCEAN = 7;
	var MOUNTAIN_ROCK = 8;
	var MUD = 9;
	var FLOWER = 10;
	var STEEL = 11;
	var ROAD = 12;
	var WOOD_BRIDGE = 13;
	var SHELL = 14;
	var TREE = 15;
	var SKY_TILE = 16;
	var CLOUD = 17;
	
	
	var blocker = new MapItems.Blocker(0, 0);
	
	var Tile = this.Tile = function() {
		this.biome = NONE;
		this.obj = null;
		
		this.cost = 1;
		this.pathiness = 0;
		
		// traversal values
		this.traversal = -1;
		this.path = 0;
		this.from;
	}
	
	var POI = function(world, x,y, biome) {
		
		this.x = x;
		this.y = y;
		
		this.biome = biome;
		this.noise = new Perlin.Grid(world.seed + biome, 30,30)
		
		// note landmark location
		world.grid[x][y].pathiness = 200;
		world.grid[x][y].cost = 0;
	}
	POI.prototype.distance = function(x,y) {
		var dx = x - this.x;
		var dy = y - this.y;
		
		var distSqr = dx*dx + dy*dy;
		
		return distSqr;
	}
	POI.prototype.warpDistance = function(x,y) {
		return this.distance(x,y) + this.noise.value(x,y)*1000;
	}
	
	var Grid = this.Grid = function(seed, w, h) {
		
		this.w = w;
		this.h = h;
		
		this.seed = seed;
		
		this.grid = [];
		
		this.landmarks = [];
		this.loots = [];
		
		this.spriteLayer = new SpriteTools.SpriteLayer(1,1);
		this.objLayer = new SpriteTools.SpriteLayer(1,1);
		this.spriteSize = {x:0, y:0, w: w*10, h: h*10};
		
		for(var x = 0; x < w; x++) {
			this.grid[x] = [];
			for(var y = 0; y < h; y++) {
				this.grid[x][y] = new Tile();
			}
		}
		
	}
	Grid.prototype.render = function(cx) {
		
		/*for(var y = 0; y < this.h; y++) {
			for(var x = 0; x < this.w; x++) {
				
				var tile = this.grid[x][y];
				
				//cx.fillStyle = "rgb("+(tile.pathiness)+","+(tile.biome * 40)+","+(tile.cost*10)+")";
				cx.fillStyle = "rgb("+(tile.biome * 40)+","+(tile.cost*10)+","+(0)+")";
				cx.fillRect(x*10, y*10, 10, 10);
			}
		}*/
		
		this.spriteLayer.paint(cx, this.spriteSize);
		this.objLayer.paint(cx, this.spriteSize);
	}
	
	// weighed queue util
	
	var weighedGet = function(queue, target) {
		
		for(var i = 0; i < queue.length; i++) {
			
			var item = queue[i];
			
			if(target < item.weight) {
				return item;
			} else {
				target -= item.weight;
			}
			
		}
		
		return queue[0];
	}
	
	// dungeon generate
	// =====================================
	
	var inkRng = new Chaos.RNG(0);
	
	var ink = function(grid, rng, x, y) {
		
		if(x < 0 || x >= grid.length) return;
		if(y < 0 || y >= grid[0].length) return;
		
		inkRng.state = rng.state;
		
		inkRng.seed(x).seed(y);
		
		var solidness = inkRng.next(16);
		
		solidness = solidness*solidness;
		
		grid[x][y].cost = grid[x][y].cost > solidness ? grid[x][y].cost : solidness;
	}
	var inkLine = function(grid, rng, x, y, orient, length) {
		
		if(orient == 0) {
			for(var i = 0; i < length; i++) {
				ink(grid, rng, x + i, y);
			}
		} else if(orient == 1) {
			for(var i = 0; i < length; i++) {
				ink(grid, rng, x, y + i);
			}
		}
		
	}
	
	var Room = function(x,y,w,h, weight) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.weight = weight;
	}
	Room.prototype.split = function(rng, queue, grid) {
		
		var roomA, roomB;
		
		var childWeight = ~~(this.weight / 3);
		
		if(rng.next(2) == 0) {
			
			// horizontal split
			
			var split = rng.next(this.w - 2);
			
			roomA = new Room(this.x, this.y, split+2, this.h, childWeight);
			roomB = new Room(this.x + split + 1, this.y, this.w - split - 1, this.h, childWeight);
			
			inkLine(grid, rng, this.x + split + 1, this.y, 1, this.h);
			
			
		} else {
			
			// vertical split
			
			var split = rng.next(this.h - 2);
			
			roomA = new Room(this.x, this.y, this.w, split+2, childWeight);
			roomB = new Room(this.x, this.y + split + 1, this.w, this.h - split - 1, childWeight);
			
			inkLine(grid, rng, this.x, this.y + split + 1, 0, this.w);
		}
		
		queue.weight -= this.weight;
		queue.weight += childWeight;
		this.weight = childWeight;
		
		if(roomA.w > 4 && roomA.h > 4) {
			queue.push(roomA);
			queue.weight += childWeight;
		}
		
		if(roomB.w > 4 && roomB.h > 4) {
			queue.push(roomB);
			queue.weight += childWeight;
		}
		
	}
	
	
	var rng = new Chaos.RNG(0);
	
	var generateObstacles = function(world, seed) {
		
		var grid = world.grid;
		
		// wall step
		for(var x = 0; x < world.w; x++) {
			grid[x][0].cost = 1000;
			grid[x][world.h - 1].cost = 1000;
		}
		for(var y = 0; y < world.h; y++) {
			grid[0][y].cost = 1000;
			grid[world.w - 1][y].cost = 1000;
		}
		
		// room subdivision step
		
		rng.reset(seed);
		
		var roomQueue = [];
		
		roomQueue.push(new Room(0, 0, world.w, world.h, 10000));
		roomQueue.weight = roomQueue[0].weight;
		
		for(var r = 0; r < 10; r++) {
			
			var t = rng.next(roomQueue.weight);
			
			weighedGet(roomQueue, t).split(rng, roomQueue, grid);
			
		}
		
		// subcell step
		
		rng.reset(seed + 1);
		
		var cellXsize = 5;
		var cellYsize = 5;
		
		var xOffset = rng.next(cellXsize);
		var yOffset = rng.next(cellYsize);
		
		var cellEmptinessWeight = 1;
		
		for(var x = -xOffset; x < world.w; x += cellXsize) {
			for(var y = -yOffset; y < world.h; y += cellYsize) {
				
				var orient = rng.next(4 + cellEmptinessWeight);
				
				if(orient == 0) { // N
					inkLine(grid, rng, x, y, 0, cellXsize);
				} else if(orient == 1) { // S
					inkLine(grid, rng, x, y + cellYsize, 0, cellXsize);
				} else if(orient == 2) { // W
					inkLine(grid, rng, x, y, 1, cellYsize);
				} else if(orient == 3) { // E
					inkLine(grid, rng, x + cellXsize, y, 1, cellYsize);
				} else {
				}
				
			}
		}
		
		// Perlin step
		
		rng.reset(seed + 2);
		
		var cellXsize = 10;
		var cellYsize = 10;
		
		var xOffset = rng.next(cellXsize);
		var yOffset = rng.next(cellYsize);
		
		var perlin = new Perlin.Grid(seed + 2, cellXsize, cellYsize);
		
		for(var x = 0; x < world.w; x++) {
			for(var y = 0; y < world.h; y++) {
				
				var noise = perlin.value(x+xOffset, y+yOffset);
				
				if(noise > 0.25) {
					ink(grid, rng, x, y);
				}
			}
		}
		
	}
	
	var trueFunct = function() {return true;}
	var closestPOI = function(list, x, y, filter) {
		
		if(!filter) filter = trueFunct;
		
		var bestPOI = null;
		var bestDist = -1;
		
		for(var i = 0; i < list.length; i++) {
			var poi = list[i];
			var dist = poi.warpDistance(x, y);
			
			if(filter(poi) && (bestDist == -1 || dist < bestDist)) {
				bestDist = dist;
				bestPOI = poi;
			}
		}
		
		return bestPOI;
		
	}
	
	var assignLoot = function(world, landmark) {
		
		
		var bestLoot = closestPOI(world.loots, landmark.x, landmark.y, function(poi) {
			return poi.biome == NONE;
		})
		
		if(bestLoot) {
			bestLoot.biome = landmark.biome;
		}
		
	}
	
	var placeLandmarks = function(world) {
		
		var grid = world.grid;
		var seed = world.seed;
		
		rng.reset(seed + 100);
		
		// place castle
		var x = rng.next(world.w >> 1) + (world.w >> 2);
		var y = rng.next(world.h >> 1) + (world.h >> 2);
		world.landmarks.push(new POI(world, x,y, CASTLE));
		
		//clear space for castle
		
		x -= 4;
		y -= 6;
		
		for(var r = 0; r < 6; r++) {
			for(var c = 0; c < 9; c++) {
				grid[x+c][y+r].pathiness = 200;
				grid[x+c][y+r].cost = 1001;
				grid[x+c][y+r].biome = RESERVED;
				grid[x+c][y+r].obj = blocker;
			}
		}
		
		world.objLayer.add(MapItems.castleSheet.make(0, x*10, y*10));
		
		// place boss gates
		
		// mountain is top always
		x = rng.next(world.w - 10) + 5;
		world.landmarks.push(new POI(world, x, 0, MOUNTAIN));
		
		// shuffle others
		var options = [DARK_FOREST, BEACH, DESERT];
		var pos = rng.next(3);
		
		var tmp = options[0];
		options[0] = options[pos];
		options[pos] = tmp;
		
		pos = rng.next(2)+1;
		
		tmp = options[1];
		options[1] = options[pos];
		options[pos] = tmp;
		
		// west
		y = rng.next(world.h - 10) + 5;
		world.landmarks.push(new POI(world, 0 /*+1*/, y, options[0])); // DUMMYOUT
		
		// south
		x = rng.next(world.w - 10) + 5;
		world.landmarks.push(new POI(world, x,world.h - 1 /*-1*/, options[1])); // DUMMYOUT
		
		// east
		y = rng.next(world.h - 10) + 5;
		world.landmarks.push(new POI(world, world.w - 1 /*-1*/, y, options[2])); // DUMMYOUT
		
		// place loot
		
		rng.reset(seed + 101);
		
		var placed = 0;
		while(placed < 5) {
			
			var x = rng.next(world.w - 2) + 1;  // DUMMYOUT
			var y = rng.next(world.h - 2) + 1;  // DUMMYOUT
			
			if(grid[x][y].pathiness == 0) {
				
				var nearest = closestPOI(world.landmarks, x,y);
				
				if(nearest.distance(x,y) <= 300) {
					continue;
				}
				
				world.loots.push(new POI(world, x, y, NONE));
				
				placed++;
				
			}
			
		}
		
		// link loot to landmarks
		
		for(var i = 0; i < world.landmarks.length; i++) {
			assignLoot(world, world.landmarks[i]);
		}
		
		// place loot at loot POIs
		
		for(var i = 0; i < world.loots.length; i++) {
			var loot = world.loots[i];
			
			var tile = grid[loot.x][loot.y];
			
			// sword @ south
			if(loot.biome == options[1]) {
				
				var sword = new MapItems.Sword(loot.x, loot.y);
				
				tile.obj = sword;
				
				world.objLayer.add(sword.sprite);
				
			}
		}
		
	}
	
	var assignBiomes = function(world) {
		
		var grid = world.grid;
		
		for(var x = 0; x < world.w; x++) {
			for(var y = 0; y < world.h; y++) {
				
				if(grid[x][y].biome != NONE) continue;
				
				var nearestLandmark = closestPOI(world.landmarks, x,y);
				var nearestLoot = closestPOI(world.loots, x,y);
				
				if(nearestLandmark.warpDistance(x,y) > nearestLoot.warpDistance(x,y)) {
					grid[x][y].biome = nearestLoot.biome;
				} else {
					grid[x][y].biome = nearestLandmark.biome;
				}
				
			}
		}
		
	}
	
	var SearchState = function(x,y, from, target, path) {
		this.x = x;
		this.y = y;
		this.weight = path + target.distance(x, y);
		this.from = from;
		this.path = path;
	}
	SearchState.prototype.search = function(traversal, world, queue, target) {
		
		var x = this.x;
		var y = this.y;
		
		// check if state is in bounds
		if(this.x < 0 || this.x >= world.w) return false;
		if(this.y < 0 || this.y >= world.h) return false;
		
		// check if there is a better path to this square already
		var tile = world.grid[this.x][this.y];
		
		if(tile.traversal == traversal && tile.path <= this.path) return false;
		
		tile.traversal = traversal;
		tile.path = this.path;
		tile.from = this.from;
		tile.pathiness = tile.pathiness > 50 ? tile.pathiness : 50;
		// see if we have hit the target
		if(this.x == target.x && this.y == target.y) {
			return true;
		}
		
		// calculate path length to neighbors
		var nextPath = this.path + tile.cost;
		
		// enqueue neighbors w/ estimated path length
		PQueue.add(queue, new SearchState(x-1,y, tile, target, nextPath));
		PQueue.add(queue, new SearchState(x,y-1, tile, target, nextPath));
		PQueue.add(queue, new SearchState(x+1,y, tile, target, nextPath));
		PQueue.add(queue, new SearchState(x,y+1, tile, target, nextPath));
		
		return false;
	}
	
	var totalTraversals = 0;
	
	var clearPath = function(world, from, to) {
		
		var grid = world.grid;
		var traversal = totalTraversals++;
		
		var source = grid[from.x][from.y];
		source.from = null;
		
		var queue = [new SearchState(from.x, from.y, null, to, 0)];
		
		while(queue.length > 0) {
			
			var state = PQueue.pop(queue);
			
			if(state.search(traversal, world, queue, to)) {
				
				break;
				
			}
			
		}
		
		var pathTile = grid[to.x][to.y];
		
		while(pathTile != null) {
			
			pathTile.pathiness = pathTile.pathiness > 100 ? pathTile.pathiness : 100;
			
			pathTile.cost = pathTile.cost > 1 ? 2 : 1; // keep token greater cost if it WAS through a wall
			
			pathTile = pathTile.from;
		}
		
	}
	
	var drawPaths = function(world) {
		
		// random paths
		
		clearPath(world, world.loots[0], world.loots[1]);
		clearPath(world, world.loots[2], world.loots[3]);
		
		// cross paths
		clearPath(world, world.landmarks[1], world.landmarks[3]);
		clearPath(world, world.landmarks[2], world.landmarks[4]);
		
		// castle to boss gates
		clearPath(world, world.landmarks[0], world.landmarks[1]);
		clearPath(world, world.landmarks[0], world.landmarks[2]);
		clearPath(world, world.landmarks[0], world.landmarks[3]);
		clearPath(world, world.landmarks[0], world.landmarks[4]);
		
		// gates to treasures
		for(var i = 0; i < 5; i++) {
			
			var landmark = world.landmarks[i];
			
			for(var j = 0; j < 5; j++) {
				
				var loot = world.loots[j];
				
				if(landmark.biome == loot.biome) {
					
					clearPath(world, landmark, loot);
					
					break;
				}
				
			}
			
		}
		
	}
	
	var layTiles = this.layTiles = function(world) {
		
		var layer = world.spriteLayer;
		var grid = world.grid;
		
		rng.reset(world.seed + 200);
		
		for(var x = 0; x < world.w; x++) {
			for(var y = 0; y < world.h; y++) {
				
				var tile = grid[x][y];
				var type = -1;
				
				switch(tile.biome) {
					case CASTLE:
						
						if(tile.pathiness > 50) {
							type = ROAD;
						} else if(tile.cost < 100) {
							if(rng.next(2) == 0) {
								type = FLOWER;
							} else {
								type = GRASS;
							}
						} else if(tile.cost >= 1000) {
							type = TREE; // SPAWNHERE
						} else {
							if(rng.next(3) == 0) {
								type = GRASS;
							} else {
								type = TREE; // SPAWNHERE
							}
						}
						
						break;
					
					case DARK_FOREST:
						if(tile.cost > 2) {
							type = TREE; // SPAWNHERE
						} else if(tile.pathiness > 0) {
							if(rng.next(7) == 0) {
								type = FLOWER;
							} else {
								type = GRASS;
							}
							
						} else {
							if(rng.next(5) == 0) {
								type = TREE; // SPAWNHERE
							} else {
								type = GRASS;
							}
						}
						
						break;
					
					case MOUNTAIN:
						
						if(tile.cost > 2) {
							type = MOUNTAIN_ROCK; // SPAWNHERE
						} else {
							type = MOUNTAIN_DIRT;
						}
						
						break;
						
					case BEACH:
						
						if(tile.cost == 2) {
							type = WOOD_BRIDGE;
						} else if(tile.cost == 1) {
							if(tile.pathiness < 50 && rng.next(40) == 0) {
								type = SHELL; // SPAWNHERE
							} else {
								type = SAND;
							}
						} else {
							type = OCEAN; // SPAWNHERE
						}
						
						break;
						
					case DESERT:
						
						if(tile.cost <= 3) {
							type = DESERT_SAND;
						} else if(tile.cost < 100 && rng.next(4) > 0) {
							type = MUD;
						} else {
							type = ROCK; // SPAWNHERE
						}
						
						break;
					
					case RESERVED:
						if(tile.cost == 1001) {
							var t = rng.next(2);
							if(t == 0) {
								type = GRASS;
							} else {
								type = FLOWER;
							}
						} else if(tile.cost == 3) {
							type = CLOUD;
						} else if(tile.cost >= 1000) {
							type = STEEL; // SPAWNHERE
						} else {
							type = SKY_TILE;
						}
						break;
				}
				
				if(type > -1) {
					
					layer.add(tileSheet.make(type, x*10, y*10));
					
					if(	type == STEEL ||
						type == TREE ||
						type == ROCK ||
						type == OCEAN ||
						type == SHELL ||
						type == MOUNTAIN_ROCK
						) {
						
						tile.obj = blocker;
					}
					
					
				}
				
			}
		}
		
		
		
	}
	
	this.generate = function(world) {
		
		var seed = world.seed;
		
		generateObstacles(world, seed);
		
		placeLandmarks(world);
		
		drawPaths(world);
		
		assignBiomes(world);
		
		layTiles(world);
		
	}
	
	
	// debug
	this.init = function(tag) {
	
	}
	
});
