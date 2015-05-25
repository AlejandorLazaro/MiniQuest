RufusLoader.Module("Enemy",["SpriteTools"],function(SpriteTools){

	//the size of a tile
	var tilesize = 10;
		
	//class for the player
	var Enemy = this.Enemy = function(sprites, world, x, y){
		this.animation = {};
		this.frame = 0;
		this.world = world;
		this.x = x;
		this.y = y;
		this.lastx = x;
		this.lasty = y;
		this.sprite = sprites.make(this.frame, x*tilesize, y*tilesize);
		this.destx = Math.round(Math.random()*80);
		this.desty = Math.round(Math.random()*60);
		this.moveTicks = 30;
		this.hitBox = {};
		this.hitBox.x = 0;
		this.hitBox.y = 0;
		this.hitBox.w = 0;
		this.hitBox.h = 0;
		this.dead = false;
	};//end player init
	
	//handles being hit
	Enemy.prototype.hit = function(clockTicks){
		this.dead = true;
		this.world.grid[this.x][this.y].obj = null;
	};
	
	//handles player input
	Enemy.prototype.move = function(){
		
		this.lastx = this.x;
		this.lasty = this.y;
		
		//update position
		this.world.grid[this.x][this.y].obj = null;
		
		if(this.destx>this.x) 
			this.x++;
		else if(this.destx<this.x)
			this.x--;
		
		if(this.desty>this.y)
			this.y++;
		else if(this.desty<this.y)
			this.y--;
		
		if(this.world.grid[this.x][this.y].obj != null) {
			this.x= this.lastx;
			this.y= this.lasty;
			
			this.destx = Math.round(Math.random()*80);
			this.desty = Math.round(Math.random()*60);
		}
		
		this.world.grid[this.x][this.y].obj = this;
		
 	};//end player movement
	
	//handles animations
	Enemy.prototype.animate = function(){
		this.frame++;
		if(this.frame >= this.animation.end+this.animation.base)
			this.frame = this.animation.start+this.animation.base;
		//update sprite
		this.sprite.frame = this.frame;
		this.hitBox.x = this.x;
		this.hitBox.y = this.y;
		this.sprite.x = this.x*tilesize;
		this.sprite.y = this.y*tilesize;
	};//end animate

	Enemy.prototype.tick = function(clockTicks){
		if(this.dead)return this.dead;
		if((clockTicks%5) == 0)
			this.animate(clockTicks);
		if((clockTicks%this.moveTicks) == 0)
			this.move(clockTicks);
		return this.dead;
	};//end tick
	
});//end module
