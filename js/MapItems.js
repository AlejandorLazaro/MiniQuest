RufusLoader.Module("MapItems",["img/Items.png", "img/Castle.png", "SpriteTools"],function(ItemsImg, CastleImg, SpriteTools){
	
	var spriteSheet = new SpriteTools.SpriteSheet(ItemsImg, 10,10, 5,1);
	var castleSheet = this.castleSheet = new SpriteTools.SpriteSheet(CastleImg, 90,60, 1,1);
	
	// do-nothing object
	this.Blocker = function() {
		
	}
	this.Blocker.prototype.hit = function() {
		// do nothing
	}
	
	// sword
	this.Sword = function(x,y) {
		this.sprite = spriteSheet.make(0, x*10, y*10);
	}
	this.Sword.prototype.isASword = true;
	this.Sword.prototype.hit = function() {
		// do nothing
	}
	
	
	
	
});//end module
