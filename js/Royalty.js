RufusLoader.Module("Royalty",["SpriteTools","Enemy","img/King.png","img/Princess.png"],function(SpriteTools,Enemy,KingSP,PrincessSP){

	//factory for the King
	var King = this.King = function(world, x, y){
		mia = new Enemy.Enemy(new SpriteTools.SpriteSheet(KingSP,10,10,2,1), world, x, y);
		mia.animation.base=0;
		mia.animation.start=0;
		mia.animation.end=2;
		return mia;
	};
	
	//factory for the Princess
	var Princess = this.Princess = function(world, x, y){
		mia = new Enemy.Enemy(new SpriteTools.SpriteSheet(PrincessSP,10,10,2,1), world, x, y);
		mia.animation.base=0;
		mia.animation.start=0;
		mia.animation.end=2;
		return mia;
	};//end player init
		
});//end module
