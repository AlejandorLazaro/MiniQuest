RufusLoader.Module("GameArea",["SpriteTools", "World", "Player", "Miasma", "Bird","Fish","SoundBox"],
	 function(SpriteTools,World,Player,Miasma,Bird,Fish,SoundBox) {

    var MainArea = this.MainArea = function(tag) {
        this.cx = tag.getContext("2d");
        this.cycles = 0;
        this.x = 0;
        this.y = 0;
        this.w = tag.width;
        this.h = tag.height;
        this.seed = (new Date()).getTime();

        // make world
        this.world = new World.Grid(this.seed, 80,60);
        World.generate(this.world);
        this.sprites = new SpriteTools.SpriteLayer(1,1);

        //prepare for player
        this.player = null;

        //Add local chars
        this.chars = [];
        for(i =0; i<5; i++){
	        enemy = Miasma.Miasma(this.world, 57, 42);
        	this.sprites.add(enemy.sprite);
        	this.chars.push(enemy);
        }

    }//end constructor

    MainArea.prototype.enter = function(player) {
    	SoundBox.playMainMusic();
        this.player = player;
        var spawn = this.world.landmarks[0];
        this.player.world = this.world;
        this.player.place(spawn.x,spawn.y);
        this.sprites.add(player.sprite);
    }

    MainArea.prototype.exit = function(player) {
    	SoundBox.stopMainMusic();
        this.sprites.remove(player.sprite);
    }

    MainArea.prototype.tick = function() {
        var cx = this.cx;

        // The Player has left the field! (North is y < 1)
        if(this.player.y < 1)
        	return true;
        this.cycles++;
        this.player.tick(this.cycles);
        for(var i = 0; i < this.chars.length; i++)
            if(this.chars[i].tick(this.cycles))
            	this.sprites.remove(this.chars[i].sprite);

        this.world.render(cx);

        this.sprites.paint(cx, this);
    }//end tick

    var BirdArea = this.BirdArea = function(tag) {
        this.cx = tag.getContext("2d");
        this.cycles = 0;
        this.x = 0;
        this.y = 0;
        this.w = tag.width;
        this.h = tag.height;
        this.seed = (new Date()).getTime();

        // make world
        this.world = new World.Grid(this.seed, 80,60);
        Bird.birdRoomGen(this.world);
        this.sprites = new SpriteTools.SpriteLayer(1,1);

        //prepare for player
        this.player = null;

        //Add local chars
        this.chars = [];
        this.boss = Bird.Bird(this.world, 50, 2);
        this.world.boss = this.boss;
        this.sprites.add(this.boss.sprite);
        this.chars.push(this.boss);
    }//end constructor

    BirdArea.prototype.enter = function(player) {
        this.player = player;
        this.boss.setTarget(player);
        this.player.world = this.world;
        this.player.place(player.x,58);
        this.sprites.add(player.sprite);
        SoundBox.playBirdMusic();
    }

    BirdArea.prototype.exit = function(player) {
        SoundBox.stopBirdMusic();
        this.sprites.remove(player.sprite);
    }

    BirdArea.prototype.tick = function() {
        var cx = this.cx;

        //if(this.player.y > 58) return true;

        this.cycles++;
        this.player.tick(this.cycles);
        if(this.boss.tick(this.cycles)) {
            // Boss is dead!
            // Wait for 1 second, then return to Main Area
            return true;
        }

        this.world.render(cx);

        this.sprites.paint(cx, this);

        // Paint the Bird boss' health bar (sprite width of Bird is 182)
        this.cx.fillStyle = "rgba(10,10,10,.5)";
        this.cx.fillRect(this.boss.sprite.x+(91)-(this.boss.max_health*5)-1,this.boss.sprite.y,(this.boss.max_health*10)+2,12);
	    this.cx.fillStyle = "rgba(255,0,0,.5)";
	    this.cx.fillRect(this.boss.sprite.x+(91)-(this.boss.max_health*5),this.boss.sprite.y+1,this.boss.health*10,10);
    }//end tick

    var FishArea = this.FishArea = function(tag) {
        this.cx = tag.getContext("2d");
        this.cycles = 0;
        this.x = 0;
        this.y = 0;
        this.w = tag.width;
        this.h = tag.height;
        this.seed = (new Date()).getTime();

        // make world
        this.world = new World.Grid(this.seed, 80,60);
        Fish.fishRoomGen(this.world);
        this.sprites = new SpriteTools.SpriteLayer(1,1);

        //prepare for player
        this.player = null;

        //Add local chars
        this.chars = [];
        this.boss = Fish.Fish(this.world, 50, 2);
        this.world.boss = this.boss;
        this.sprites.add(this.boss.sprite);
        this.chars.push(this.boss);
    }//end constructor

    FishArea.prototype.enter = function(player) {
        this.player = player;
        this.boss.setTarget(player);
        this.player.world = this.world;
        this.player.place(player.x,58);
        this.sprites.add(player.sprite);
        SoundBox.playFishMusic();
    }

    FishArea.prototype.exit = function(player) {
        SoundBox.stopFishMusic();
        this.sprites.remove(player.sprite);
    }

    FishArea.prototype.tick = function() {
        var cx = this.cx;

        //if(this.player.y > 58) return true;

        this.cycles++;
        this.player.tick(this.cycles);
        if(this.boss.tick(this.cycles)) {
            // Boss is dead!
            // Wait for 1 second, then return to Main Area
            return true;
        }

        this.world.render(cx);

        this.sprites.paint(cx, this);

        // Paint the Fish boss' health bar (sprite width of Fish is 182)
        this.cx.fillStyle = "rgba(10,10,10,.5)";
        this.cx.fillRect(this.boss.sprite.x+(91)-(this.boss.max_health*5)-1,this.boss.sprite.y,(this.boss.max_health*10)+2,12);
        this.cx.fillStyle = "rgba(255,0,0,.5)";
        this.cx.fillRect(this.boss.sprite.x+(91)-(this.boss.max_health*5),this.boss.sprite.y+1,this.boss.health*10,10);
    }//end tick

});
