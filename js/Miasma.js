RufusLoader.Module("Miasma",["SpriteTools","Enemy","img/Miasma.png"],function(SpriteTools,Enemy,Sprites){

	//class for the player
	var Miasma = this.Miasma = function(world, x, y){
		mia = new Enemy.Enemy(new SpriteTools.SpriteSheet(Sprites,10,10,2,1), world, x, y);
		mia.animation.base=0;
		mia.animation.start=0;
		mia.animation.end=2;
		mia.hitBox.w=1;
		mia.hitBox.h=1;
		return mia;
	};//end player init
		
});//end module
