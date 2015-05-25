RufusLoader.Module("Game",["Keycontrol","SpriteTools", "GameArea", "Player"],function(Keycontrol,SpriteTools,GameArea,Player){
	
	//Frame Rate
	var FRAME=1000/30;
	
	//the game itself
	var Game = function(tag){
		
		this.tag = tag;
		this.cx = tag.getContext("2d");
		
		this.cx.fillStyle = "#004";
		this.cx.font = "20pt monospace"
		this.cx.fillText("Generating Level...", 30, 30);
		
		this.cycles = 0;
		this.x = 0;
		this.y = 0;
		this.w = tag.width;
		this.h = tag.height;
		
		Keycontrol.addFocusGrabber(tag);
		
		this.ready = false;
		
	}//end Game
	
	// level generation can take a while, so wait a tick first
	// to allow the "Generating Level" message to reach the screen
	Game.prototype.init = function() {
		
		this.mainArea = new GameArea.MainArea(this.tag);
		this.birdArea = new GameArea.BirdArea(this.tag);	
		this.region = this.mainArea;
		
		this.player = new Player.Player(this.world, 4, 20);		
		
		this.region.enter(this.player);
		
		
		this.ready = true;
	}
	
	//draw frame!
	Game.prototype.tick = function() {
		
		if(this.ready == false) {
			this.init();
		}
		
		if(this.region.tick()){
			this.region.exit(this.player);
			if(this.region == this.mainArea)
				this.region = this.birdArea;
			else this.region = this.mainArea;
			this.region.enter(this.player);
		}

		// Draw the Player's health bar
		this.cx.fillStyle = "rgba(10,10,10,.5)";
		this.cx.fillRect(349,569,15*this.player.max_health+2,12);
		this.cx.fillStyle = "rgba(255,0,0,.5)";
		this.cx.fillRect(350,570,15*this.player.health,10);
	}//end tick
	
	this.init = function(canvasTag) {
		var cx = canvasTag.getContext("2d");
		var w = canvasTag.width;
		var h = canvasTag.height;
		
		Keycontrol.focus();
		
		var g = new Game(canvasTag);
		window.setInterval(function(){
			g.tick();
		},FRAME);
	}//end init	
});
