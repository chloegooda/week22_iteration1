// phaser config

var config = {
	type: Phaser.AUTO,
	width: 16 * 16 * 2, // tilesize * aspect ratio * zoom
	height: 16 * 9 * 2,

	scene: [SceneA, SceneB],

	pixelArt: true,

	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 650 },
			debug: false
		}
    },
    
    callbacks: {
        postBoot: function () {
            resize();
        }
    }
}

// initialise game & variables

var game = new Phaser.Game(config);
var moveLeft, moveRight, jumpUp;
var inventory = [], inventoryImage;
var springs, keys;
var fireAbilities, waterAbilities, electricAbilities;
var fireElementals;
var paused;
var largeBlocks;
var portals;

function resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }

    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}