RufusLoader.Module("Player",["Keycontrol","SpriteTools","img/Sprites.png"],function(Keycontrol,SpriteTools,Sprites){

	//the size of a tile
	var tilesize = 10;
		
	//class for the player
	var Player = this.Player = function(world, x, y){
		sprites = new SpriteTools.SpriteSheet(Sprites,10,10,5,4);
		this.max_health = 5;
		this.health = 5;
		this.last_time_hit = 0;
		this.dead = false;
		this.animation = {};
		this.animation.base=0;
		this.animation.start=0;
		this.animation.end=4;
		this.frame = this.animation.base+this.animation.start;
		this.world = world;
		this.x = x;
		this.y = y;
		this.destx = x;
		this.desty = y;
		this.lastx = x;
		this.lasty = y;
		this.sprite = sprites.make(this.frame, x*tilesize, y*tilesize);
		
		this.attack = 0;
		
		this.hasSword = false;
		
	};//end player init
	
	//forcably moves the player
	Player.prototype.place = function(x,y){
		
		this.world.grid[this.x][this.y].obj = null;
		
		this.x = x;
		this.y = y;
		this.destx = x;
		this.desty = y;
		this.lastx = x;
		this.lasty = y;
		
		this.world.grid[this.x][this.y].obj = this;
		
	};//end place
	
	//handles player input
	Player.prototype.move = function(){
		if(Keycontrol.up){
			this.desty = this.lasty - 1;
		}
		else if(Keycontrol.down){
			this.desty =this.lasty + 1;
		}
		else if(Keycontrol.right){
			this.destx =this.lastx + 1;
		}
		else if(Keycontrol.left){
			this.destx =this.lastx - 1;
		}
		
		if(this.hasSword && Keycontrol.action && this.attack <= 0) {
			this.attack = 30;
		}
		
		var inWay = this.world.grid[this.destx][this.desty].obj;
		
		if(inWay && inWay.isASword) {
			this.hasSword = true;
			this.animation.base = 5;
			
			this.world.objLayer.remove(inWay.sprite);
			
			this.world.grid[this.destx][this.desty].obj = inWay = null;
		}
		
		if(inWay != null && inWay != this){
			this.destx= this.lastx;
			this.desty= this.lasty;
		}
		else if(this.destx < 0 || this.desty < 0 || this.destx > 80 ||  this.desty > 60){
			this.destx= this.lastx;
			this.desty= this.lasty;
		}
 	};//end player movement
	
	//handles animations
	Player.prototype.animate = function(){
		this.frame++;
		if(this.frame >= this.animation.end+this.animation.base)
			this.frame = this.animation.start+this.animation.base;
		
		
		//update position
		this.world.grid[this.x][this.y].obj = null;
		
		if(this.destx>this.x) 
			this.x += 1;
		else if(this.destx<this.x)
			this.x -= 1;
		else this.lastx = this.destx;
		
		if(this.desty>this.y)
			this.y += 1;
		else if(this.desty<this.y)
			this.y -= 1;
		else this.lasty = this.desty;
		
		this.world.grid[this.x][this.y].obj = this;
		
		//update sprite
		this.sprite.frame = this.frame;
		this.sprite.x = this.x*tilesize;
		this.sprite.y = this.y*tilesize;
	};//end animate
	
	var attack = function(obj, clockTicks) {
		if(obj && obj.hit) {
			obj.hit(clockTicks);
		}
	}
	
	//handles being hit
	Player.prototype.hit = function(clockTicks){
		if(this.health > 0) {
			if(clockTicks - this.last_time_hit > 30) {
				this.health--;
				this.last_time_hit = clockTicks;
			}
		} else {
			this.dead = true;
		}
	};
	
	Player.prototype.tick = function(clockTicks){
		if(this.world.boss) {
			
			var box = this.world.boss.hitBox;
			
			if(box.x <= this.x && box.x + box.w >= this.x) {
				if(box.y <= this.y && box.y + box.h >= this.y) {
					
					if(this.attack >= 15) {
						attack(this.world.boss, clockTicks);
					} else {
						this.hit(clockTicks);
					}
					
				}
			}
			
		}
		
		if(this.attack > 15) {
			
			this.animation.base = 8;
			this.animation.end = 2;
			
			attack(this.world.grid[this.x+1][this.y].obj, clockTicks);
			attack(this.world.grid[this.x-1][this.y].obj, clockTicks);
			attack(this.world.grid[this.x][this.y+1].obj, clockTicks);
			attack(this.world.grid[this.x][this.y-1].obj, clockTicks);
			
			
		} else if(this.attack > 0) {
			
			this.animation.base = 5;
			this.animation.end = 4;
			
		}
		this.attack--;
		
		this.move();
		if((clockTicks%2) == 0)
			this.animate();
	};//end tick
	
});//end module
