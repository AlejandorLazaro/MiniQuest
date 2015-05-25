RufusLoader.Module("Bird",["SpriteTools","Enemy","img/Bird.png", "World", "Perlin","ogg/BirdDive","ogg/BirdAway"],
	function(SpriteTools,Enemy,Sprites,World,Perlin,AttackCry,HitCry){

	AttackCry.loop = false;
	AttackCry.volume = 1;
	HitCry.loop = false;
	HitCry.volume = 1;
	
	//class for the player
	var Bird = this.Bird = function(world, x, y){
		bird = new Enemy.Enemy(new SpriteTools.SpriteSheet(Sprites,182,119,3,2), world, x, y);
		bird.max_health = 9;
		bird.health = 9; // Too low at 3 hp...	
		bird.last_time_hit = 0;	
		bird.animation.base = 0;
		bird.animation.start = 0;
		bird.animation.end = 3;
		bird.moveTicks = 10;
		bird.hitBox.w = 18;
		bird.hitBox.h = 12;
		
		bird.setTarget = function(t){
			this.target = t;
		}
		
		bird.hit = function(clockTicks){
			if(bird.health > 0) {
				if(clockTicks - bird.last_time_hit > 15) {
					bird.health--;
					bird.last_time_hit = clockTicks;
				}
			} else {
				this.dead = true;
			}
		}
		
		//first up, wait
		bird.startWait = function(clock){
			this.waitStart = clock;
			this.waitTime = Math.round(Math.random()*160)+40;
			this.animation.base = 0;
			this.moveTicks = 30;
			this.move=this.wait;
		}
		bird.wait = function(clock){
			//switch to attack mode
			if(clock-this.waitStart > this.waitTime){
				this.move = this.startAttack;
			}
		}
		
		//next possable plan, attack
		bird.startAttack = function(clock){
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
		
		bird.attack = function(clock){
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
		bird.startHide = function(clock){
			this.hideStart = clock;
			this.hideTime = Math.round(Math.random()*140)+40;
			this.animation.base = 0;
			this.speed = 2;
			this.destx = Math.round(Math.random()*40)+10;
			this.desty = Math.round(Math.random()*20)+5;
			this.moveTicks = 10;
			this.move = this.hide;
		}
		
		bird.hide = function(clock){
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
		
		bird.move = bird.startWait;
		
		return bird;
	};//end boss init
	
	// boss arena
	
	var birdRoomGen = this.birdRoomGen = function(world) {
		
		var grid = world.grid;
		
		var noise = new Perlin.Grid(world.seed, 25, 10);
		
		for(var x = 0; x < world.w; x++) {
			for(var y = 0; y < world.h; y++) {
				
				var tile = grid[x][y];
				
				if(y + 10 == world.h || y == world.h - 1 || x == 0 || x == world.w - 1) {
					tile.cost = 1000;
					tile.biome = World.MOUNTAIN;
				} else if(y + 10 > world.h) {
					tile.cost = 1;
					tile.biome = World.MOUNTAIN;
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
