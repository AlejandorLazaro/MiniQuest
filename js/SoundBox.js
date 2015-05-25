RufusLoader.Module("SoundBox", ["ogg/KidOverworld","ogg/Desert"], function(Overworld,BirdArea){

	Overworld.loop = true;
	Overworld.volume = .70;
	BirdArea.loop = true;
	BirdArea.volume = .70;

	this.playMainMusic = function(){
	    Overworld.play();
	}
	
	this.stopMainMusic = function(){
		Overworld.pause();
	}
	
	this.playBirdMusic = function(){
		BirdArea.play();
	}
	
	this.stopBirdMusic = function(){
		BirdArea.pause();
	}
});
