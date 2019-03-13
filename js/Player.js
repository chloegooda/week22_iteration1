// player class

// TODO make movement from clicking buttons into functions.

class Player {
	constructor(scene, x, y, spritesheet, frame) {
		this.scene = scene;
		this.bunny = scene.physics.add.sprite(x, y, spritesheet, frame)
		this.bunny.body.setSize(this.bunny.body.width - 17, this.bunny.body.height - 4);
		this.bunny.setCollideWorldBounds(true);
		this.bunny.body.setOffset(8, 5);
		this.currentSpeed = 0;
		this.maxJumps = 2;
		this.jumpCount = 0;
		this.keys = scene.input.keyboard.addKeys(
			{
				left: Phaser.Input.Keyboard.KeyCodes.LEFT,
				right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
				up: Phaser.Input.Keyboard.KeyCodes.UP,
				down: Phaser.Input.Keyboard.KeyCodes.DOWN
			}
		);
	}

	enableCollision(destructibleLayer) {
		this.scene.physics.add.collider(this.bunny.body, destructibleLayer); 
	}

	createAnimations() {

	}

	checkMovement() {
		var cursors = this.scene.input.keyboard.createCursorKeys();

		// right movement
		if (moveRight === true) {
			this.bunny.setVelocityX(100);
			this.bunny.flipX = false;
		}

		// left movement
		else if (moveLeft === true) {
			this.bunny.setVelocityX(-100);
			this.bunny.flipX = true;
		}

		// down movement
		else if (cursors.down.isDown) {
			this.bunny.setVelocityX(0);
		}

		// idle
		else {
            this.bunny.setVelocityX(0);
            moveRight = false;
            moveLeft = false;
        }

        if (this.bunny.body.blocked.down) {
            this.jumpCount = 0;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            jumpUp = true;
        }

        if (jumpUp === true) {
            if (Phaser.Input.Keyboard.JustDown(cursors.up) || this.jumpCount < this.maxJumps) {
                this.jumpCount++;
                this.bunny.setVelocityY(-275);
                jumpUp = false;
            }
        }

		if(Phaser.Input.Keyboard.JustDown(cursors.right)) {
			this.scene.switchScene();
		}
	}

	update() {
	    this.checkMovement();
	}
};