// ©2012 Tangent 128.
// This script is provided without warranty as free software.
// It may be freely used, modified, and/or redistributed, so
// long as modified versions do not claim to be the original.


window.RufusLoader = window.RufusLoader || {};	// make RufusLoader namespace object
(function(RufusLoader) {	// make a scope for local variables


// Fetching Policy
// ===============

// locate resource by name and treat according to type
RufusLoader.requestResource = function(name, mod) {
	
	// current policy:
	// bare names assumed to be modules located at js/NAME.js
	// filenames under img/ assumed to be images, at the same location.
	// filenames under wav/ are taken to be sounds (eventually, mp3/
	// and vorbis/ likewise, with logic for audio/ to select appropriate for browser)
	
	var base = "";
	
	if( (/^img\//).test(name) ) {
		
		RufusLoader.requestImage(base + name, mod);
		
	} else if( (/^wav\//).test(name) ) {
	
		RufusLoader.requestAudio(base + name + ".wav", mod, "audio/wav");
	
	} else if( (/^ogg\//).test(name) ) {
		
		RufusLoader.requestAudio(base + name + ".ogg", mod, "audio/ogg");
	
	} else {
		
		RufusLoader.requestScript(base + "js/" + name + ".js");
		
	}
	
}

// Requesting Logic
// ================

var doc = document;
var head = doc.getElementsByTagName("head")[0];
var doNothing = function() {};

// begin loading a script resource
RufusLoader.requestScript = function(src) {
	
	var script = doc.createElement("script");
	script.type = "text/javascript";
	script.src = src;
	
	head.appendChild(script);
	
}

// begin loading an image resource
RufusLoader.requestImage = function(src, mod) {
	
	var img = new Image();
	
	mod.obj = img;
	
	img.addEventListener("load", function(evt) {
		RufusLoader.Module(mod.name, [], doNothing);
	}, false);
	
	img.src = src;
	
	if(img.height > 0) { // IE doesn't fire load events for cached images???
		RufusLoader.Module(mod.name, [], doNothing);
	}
	
}

// begin loading an sound resource
RufusLoader.requestAudio = function(src, mod, type) {
	
	var audio = new Audio();
	
	mod.obj = audio;
	
	// hackish test to fallback for browsers that can't play the sound
	
	var canPlayIt = audio.canPlayType(type);
	
	if(canPlayIt && canPlayIt != "no") {
	
		audio.addEventListener("canplay", function(evt) {
			RufusLoader.Module(mod.name, [], doNothing);
		}, false);
		
		// if loading fails, carry on
		audio.addEventListener("error", function(evt) {
			RufusLoader.Module(mod.name, [], doNothing);
		}, false);
		
		audio.src = src;
	
	} else {
		// if can't play, carry on
		RufusLoader.Module(mod.name, [], doNothing);
	}
	
}

// Module / Dependency Management
// ==============================

var UNKNOWN = 0;	// newly aware of
var REQUESTING = 1;	// pulling in script file
var LOADED = 2;	// function is loaded, but not executed
var READY = 3;	// function called

var ModRecord = function(name) {
	this.name = name;
	this.status = UNKNOWN;
	this.depends = new Array();	// is waiting for these
	this.onLoad = new Array();	// do these once ready
	
	this.obj = {};
	this.funct = false;
};

var module = RufusLoader.module = {};
var waiting = {};

// returns named module;
// if previously unknown, starts to load it.
var ensureModule = function(name) {

	var mod = module[name] = module[name] || new ModRecord(name);
	
	if(mod.status >= REQUESTING) {
		return mod;
	}
	
	mod.status = REQUESTING;
	
	RufusLoader.requestResource(name, mod);
	
	return mod;

}

// returns true if given module is initialized;
// false if can't do so yet.
var ready = RufusLoader.ready = function(name) {

	var mod = ensureModule(name);
	
	if(mod.status < LOADED) {
		return false;
	}
	
	if(mod.status == READY) {
		delete waiting[name];
		return mod.obj;
	}
	
	// module function is loaded, but not run yet. See if we can.
	
	var canInit = true;
	var initArgs = new Array(); // we'll pass the dependency objects to the module function, allowing for namespacing
	
	for(var i = 0; i < mod.depends.length; i++) {
		canInit = canInit && ready(mod.depends[i].name); // recurse into dependencies
		initArgs[i] = mod.depends[i].obj;
	}
	
	if(canInit) {
	
		mod.funct.apply(mod.obj, initArgs);
		mod.status = READY;
		
		// run onLoad callbacks
		for(var i = 0; i < mod.onLoad.length; i++) {
			mod.onLoad[i](mod.obj);
		}
		
		mod.onLoad = false; // done with callback list
		
		return mod.obj;
	
	}
	
	return false;

}

// queues a function to be called (w/o arguments) when
// a given module is loaded (immediately if it's already loaded)
var doWhenReady = RufusLoader.doWhenReady = function(name, callback) {

	var mod = ensureModule(name);
	
	if(mod.status == READY) {
		callback(mod.obj);
	} else {
		mod.onLoad.push(callback);
	}
}

// called in module script file; indicates script has
// been loaded, gives dependencies and init function
RufusLoader.Module = function(name, deps, funct) {

	var mod = ensureModule(name);
	
	if(mod.status == LOADED) { // extraneous load attempt
		return;
	}
	
	// note dependencies
	for(var i in deps) {
		var depName = deps[i];
		var dependency = ensureModule(depName);
		mod.depends.push(dependency);
	}
	
	// register init function
	mod.funct = funct;
	
	mod.status = LOADED;
	
	// note that this module needs initializing
	waiting[name] = mod;
	
	// try to load this and any other modules in need of initializing
	for(var m in waiting) {
		ready(m);
	}

}

// Applet Initialization
// =====================

var initApplets = RufusLoader.initApplets = function(tag) {
	
	if(!tag || tag.nodeType != 1) { // 1 == tag/element, instead of attributes or text
		return false;
	}
	
	var appletName = tag.getAttribute("data-applet-name");
	
	if(appletName) {
		
		var oldDisplay = tag.style.display;
		
		tag.style.display = "none";
		
		doWhenReady(appletName, function(applet) {
			tag.style.display = oldDisplay;
			
			applet.init(tag);
		});
		
		return true;
		
	} else {
		
		var found = false;
		
		for(var c in tag.childNodes) {
			found = initApplets(tag.childNodes[c]) || found;
		}
		
		return found;
		
	}
	
	return false;
}

var runPageLoad = false;
var pageLoadApplets = function() {
	
	if(runPageLoad) return;
	
	runPageLoad = initApplets(document.body);
}

pageLoadApplets();
window.addEventListener("load", pageLoadApplets, false);
window.addEventListener("DOMContentLoaded", pageLoadApplets, false);

})(window.RufusLoader);
