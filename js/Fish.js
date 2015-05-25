RufusLoader.Module("Fish",["SpriteTools","Enemy","img/Fish.png", "World", "Perlin","ogg/Splash","ogg/FishAway"],
	function(SpriteTools,Enemy,Sprites,World,Perlin,AttackCry,HitCry){

	AttackCry.loop = false;
	AttackCry.volume = 1;
	HitCry.loop = false;
	HitCry.volume = 1;
	
	//class for the player
	var Fish = this.Fish = function(world, x, y){
		fish = new Enemy.Enemy(new SpriteTools.SpriteSheet(Sprites,350,452,3,2), world, x, y);
		fish.max_health = 9;
		fish.health = 9; // Too low at 3 hp...	
		fish.last_time_hit = 0;	
		fish.animation.base = 0;
		fish.animation.start = 0;
		fish.animation.end = 3;
		fish.moveTicks = 10;
		fish.hitBox.w = 18;
		fish.hitBox.h = 12;
		
		fish.setTarget = function(t){
			this.target = t;
		}
		
		fish.hit = function(clockTicks){
			if(fish.health > 0) {
				if(clockTicks - fish.last_time_hit > 15) {
					fish.health--;
					fish.last_time_hit = clockTicks;
				}
			} else {
				this.dead = true;
			}
		}
		
		//first up, wait
		fish.startWait = function(clock){
			this.waitStart = clock;
			this.waitTime = Math.round(Math.random()*160)+40;
			this.animation.base = 0;
			this.moveTicks = 30;
			this.move=this.wait;
		}
		fish.wait = function(clock){
			//switch to attack mode
			if(clock-this.waitStart > this.waitTime){
				this.move = this.startAttack;
			}
		}
		
		//next possable plan, attack
		fish.startAttack = function(clock){
			this.attackStart = clock;
			this.attackTime = Math.round(Math.random()*160)+180;
			this.animation.base = 3;
			this.speed = 5;
			this.destx = Math.round(Math.random()*5) + this.target.x - 10;
			this.desty = Math.round(Math.random()*10) + 40;
			this.moveTicks = 6;
			this.move = this.attack;
			AttackCry.play();
		}
		
		fish.attack = function(clock){
			//update position
			if(this.destx>this.x) 
				this.x+=this.speed;
			else if(this.destx<this.x)
				this.x-=this.speed;
				
			if(this.desty>this.y)
				this.y+=this.speed;
			else if(this.desty<this.y)
				this.y-=this.speed;
				
			//check if we've reached point
			if(this.destx-5 < this.x && this.x < this.destx+5 
			   && this.desty-5 < this.y && this.y < this.desty+5){
			   	this.destx=this.x;
			   	this.desty=this.y;
			   	this.attackTime = Math.round(Math.random()*20)+40;
			}

			// End Attack Stage
			if(clock-this.attackStart > this.attackTime){
				this.move = this.startHide;
			}
			
		}
		
		//and finally, return back to the sky
		fish.startHide = function(clock){
			this.hideStart = clock;
			this.hideTime = Math.round(Math.random()*140)+40;
			this.animation.base = 0;
			this.speed = 2;
			this.destx = Math.round(Math.random()*40)+10;
			this.desty = Math.round(Math.random()*20)+5;
			this.moveTicks = 10;
			this.move = this.hide;
		}
		
		fish.hide = function(clock){
			//update position
			if(this.destx>this.x) 
				this.x+=this.speed;
			else if(this.destx<this.x)
				this.x-=this.speed;
			if(this.desty>this.y)
				this.y+=this.speed;
			else if(this.desty<this.y)
				this.y-=this.speed;
			
			if(this.destx-5 < this.x && this.x < this.destx+5 
			   && this.desty-5 < this.y && this.y < this.desty+5)
			   	this.move = this.startWait;
			
		}
		
		fish.move = fish.startWait;
		
		return fish;
	};//end boss init
	
	// boss arena
	
	var fishRoomGen = this.fishRoomGen = function(world) {
		
		var grid = world.grid;
		
		var noise = new Perlin.Grid(world.seed, 25, 10);
		
		for(var x = 0; x < world.w; x++) {
			for(var y = 0; y < world.h; y++) {
				
				var tile = grid[x][y];
				
				if(y + 10 == world.h || y == world.h - 1 || x == 0 || x == world.w - 1) {
					tile.cost = 1000;
					tile.biome = World.BEACH;
				} else if(y + 10 > world.h) {
					tile.cost = 1;
					tile.biome = World.BEACH;
				} else {
					if(noise.value(x,y) > 0.2) {
						tile.cost = 3;
					} else {
						tile.cost = 2;
					}
					tile.biome = World.RESERVED;
				}
				
			}
		}
		
		World.layTiles(world);
		
	}
	
});//end module
