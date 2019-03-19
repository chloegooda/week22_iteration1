// scene classes

class BaseScene extends Phaser.Scene {
	constructor(id) {
		super(id);
		this.id = id;
		this.tileDataKey;
		this.tileDataSource;
	}

	preload() {
		this.load.tilemapTiledJSON(this.tileDataKey, this.tileDataSource);
		this.load.image('background', 'assets/environment/background.png');
		this.load.image('midground', 'assets/environment/middleground.png');
		this.load.image('tileset', 'assets/tileset.png');
		this.load.spritesheet(
			'player-idle',
			'assets/sprites/player/idle.png', {
				frameWidth: 37,
				frameHeight: 32,
				margin: 0,
				spacing: 0
			}
		)
		this.load.spritesheet(
			'sparks',
			'assets/sprites/player/sparks.png', {
				frameWidth: 17,
				frameHeight: 5,
				margin: 0,
				spacing: 0
			}
		)
		this.load.spritesheet(
			'abilities',
			'assets/sprites/abilities/abilities.png', {
				frameWidth: 16,
				frameHeight: 16,
				margin: 0,
				spacing: 0
			}
		)
		this.load.spritesheet(
			'spring',
			'assets/environment/spring.png', {
				frameWidth: 28,
				frameHeight: 22,
				margin: 0,
				spacing: 0
			}
		)
		this.load.spritesheet(
			'portal',
			'assets/environment/portal2.png', {
				frameWidth: 26,
				frameHeight: 31,
				margin: 0,
				spacing: 0
			}
		)
		this.load.spritesheet(
			'fireElemental',
			'assets/sprites/elementals/fire.png', {
				frameWidth: 16,
				frameHeight: 16,
				margin: 0,
				spacing: 0
			}
        )
        this.load.spritesheet(
            'largeBlocks',
            'assets/environment/largeBlocks.png', {
                frameWidth: 32,
                frameHeight: 32,
                margin: 0,
                spacing: 0
            }
        )

		// TODO make UI buttons into spritesheet
        this.load.image('leftBTN', 'assets/sprites/ui/leftBTN.png');
        this.load.image('rightBTN', 'assets/sprites/ui/rightBTN.png');
        this.load.image('shootBTN', 'assets/sprites/ui/shootBTN.png');
        this.load.image('jumpBTN', 'assets/sprites/ui/jumpBTN.png');
        this.load.image('inventoryBTN', 'assets/sprites/ui/inventory.png');
		this.load.spritesheet('pauseBTN', 'assets/sprites/ui/pauseBTN.png', {frameWidth: 24, frameHeight: 24, margin: 0, spacing: 0 });
		this.load.image('restartBTN', 'assets/sprites/ui/restartBTN.png');
		this.load.image('paused', 'assets/sprites/ui/paused.png');
	}

    create() {
        // reset window
        window.addEventListener("resize", resize, false);
		paused = false;
		inventory = [];

		// map
		var background = this.add.image(config.width / 2, config.height / 2, "background").setScale(1.4, 1).setScrollFactor(0);
		var midground = this.add.image(config.width / 2, config.height / 2, "midground").setScale(1.6, 1.6).setScrollFactor(0.5);
		this.map = this.make.tilemap({ key: this.tileDataKey });
		var tileset = this.map.addTilesetImage('tileset', 'tileset');
		this.map.createStaticLayer('background', tileset, 0, 0);

		// collision layer
		this.collisionLayer = this.map.createStaticLayer('collisions', tileset, 0, 0);
		this.collisionLayer.setCollisionBetween(0, 1000);

		// destructibles layer
		this.destructibleLayer = this.map.createDynamicLayer('destructibles', tileset, 0, 0);
		this.destructibleLayer.setCollisionByProperty({ collides: true });

		this.map.createStaticLayer('decoration', tileset, 0, 0);

		// abilities
		fireAbilities = this.physics.add.staticGroup();
		waterAbilities = this.physics.add.staticGroup();
		electricAbilities = this.physics.add.staticGroup();
		this.map.findObject('items', function(ability) {
			if (ability.type === 'ability') {
				if (ability.name === 'fire') {
					fireAbilities.create(ability.x + 8, ability.y - 8, 'abilities', 1);
				} else if (ability.name === 'water') {
					waterAbilities.create(ability.x + 8, ability.y - 8, 'abilities', 2);
				} else if (ability.name === 'electric') {
					electricAbilities.create(ability.x + 8, ability.y - 8, 'abilities', 3);
				}
			}
		});

		// enemies (elemental)
		fireElementals = this.physics.add.staticGroup();
        this.map.findObject('items', function (enemy) {
            if (enemy.type === 'elemental') {
                if (enemy.name === 'fire') {
                    fireElementals.create(enemy.x + 8, enemy.y - 8, 'fireElemental');
                }
            }
        });
		this.createEnemyAnims();

		// extras
		springs = this.physics.add.staticGroup();
		this.map.findObject('items', function(object) {
			if (object.type === 'spring') {
				springs.create(object.x + 14, object.y - 11, 'spring');
			}
		});

        portals = this.physics.add.staticGroup();
        this.map.findObject('items', function (object) {
            if (object.name === 'portal') {
                portals.create(object.x + 8, object.y - 8, 'portal');
            }
        });
        this.createPortalAnims();

		keys = this.physics.add.staticGroup();
        this.map.findObject('items', function (object) {
            if (object.type === 'key') {
                keys.create(object.x + 8, object.y - 8, 'abilities', 4);
            }
        });

        largeBlocks = this.physics.add.staticGroup();
        this.map.findObject('items', function (object) {
            if (object.type === 'largeBlock') {
                if (object.name === 'bull') {
                    largeBlocks.create(object.x + 8, object.y - 8, 'largeBlocks', 0);
                } else if (object.name === 'plain') {
                    largeBlocks.create(object.x + 8, object.y - 8, 'largeBlocks', 1);
                }
            }
        });

		// player
		var playerSpawn = this.map.findObject('player', function(object) {
			if (object.name === 'playerSpawn') {
				return object;
			}
		});
		
		this.player = new Player(this, playerSpawn.x, playerSpawn.y, 'player-idle', 0);

		// camera
		var camera = this.cameras.main;
		camera.zoom = 2;
		camera.startFollow(this.player.bunny);
		camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // sparks
        this.sparks = this.physics.add.group({
            defaultKey: 'sparks',
			defaultFrame: 0,
            allowGravity: false,
            velocityX: 150,
            maxSize: 10
        });
		this.createSparkAnims();

        // buttons
        this.buttons = this.physics.add.staticGroup();
        this.createButtons();

		// inventory
		inventoryImage = this.add.image(config.width / 2 + 110, config.height / 2 - 55, 'abilities', 0).setScrollFactor(0);

        // collisions
		this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.add.collider(this.player.bunny, this.collisionLayer);
		this.physics.add.overlap(this.player.bunny, springs, function(player, spring) {
			player.setVelocityY(-350);
		});
		// picking up items
		this.physics.add.overlap(this.player.bunny, fireAbilities, function(player, ability) {
			inventory.pop();
			inventory.push('fire');
			ability.disableBody(true, true);
		});
		this.physics.add.overlap(this.player.bunny, waterAbilities, function(player, ability) {
			inventory.pop()
			inventory.push('water');
			ability.disableBody(true, true);
		});
		this.physics.add.overlap(this.player.bunny, electricAbilities, function(player, ability) {
			inventory.pop();
			inventory.push('electric');
			ability.disableBody(true, true);
		});
		this.physics.add.overlap(this.player.bunny, keys, function(player, key) {
			inventory.pop();
			inventory.push('key');
			key.disableBody(true, true);
		})

		// shooting elementals
		this.physics.add.overlap(this.sparks, fireElementals, function(spark, enemy) {
			if (inventory.includes('water')) {
				enemy.disableBody(true, true);
			}
			spark.disableBody(true, true);
		})

		// elementals hurting player
        this.physics.add.overlap(this.player.bunny, fireElementals, this.restartScene, null, this);

        // player unlock blocks
        this.physics.add.collider(this.player.bunny, this.destructibleLayer);

        this.physics.add.collider(this.player.bunny, largeBlocks, function (player, block) {
            if (inventory.includes('key')) {
                inventory.pop();
                block.disableBody(true, true);
            }
        })

        // start next level
        this.physics.add.collider(this.player.bunny, portals, this.switchScene, null, this);

        this.input.addPointer();
        this.input.addPointer();

        this.physics.world.on('worldbounds', this.killSpark, this)
	}

	update(time, delta) {
		this.player.update();
        fireElementals.playAnimation('fireAnims', true);
        portals.playAnimation('portal', true);
		this.checkInventory();
	}

    // additional shooting functions
    shoot() {
		if (! paused) {
			var spark = this.sparks.get(this.player.bunny.x, this.player.bunny.y + 7);
			if (spark) {
				this.checkInventory();
				this.checkAttack();
				spark.body.collideWorldBounds = true;
				spark.body.onWorldBounds = true;
				spark.enableBody(false, this.player.bunny.x, this.player.bunny.y, true, true);
				if (this.player.bunny.flipX == true) {
					spark.setVelocityX(-150);
					spark.flipX = true;
				}
				else {
					spark.setVelocityX(150);
					spark.flipX = false;
				}
				spark.setActive(true);
				spark.setVisible(true);
				this.physics.add.collider(spark, this.destructibleLayer, this.sparkHitWall, null, this);
				this.time.delayedCall(2500, this.killSpark, [spark.body], this);
			}
		}
    }

    killSpark(body) {
        body.gameObject.disableBody(true, true);
    }

	sparkHitWall(spark, tile) {
		var tileProperties = this.destructibleLayer.tileset[0].tileProperties[tile.index];
		var checkCollision = false;
		if (tileProperties) {
			if (tileProperties.collides) {
				checkCollision = true;
			}
		}
		// killed by anything
        if (tile.index === 149) {
            const newTile = this.destructibleLayer.putTileAt(152, tile.x, tile.y);
            newTile.setCollision(false);
        }
        // killed by fire
        else if (tile.index === 24 || tile.index === 4 || tile.index === 6) {
            if (inventory.includes('fire')) {
                const newTile = this.destructibleLayer.putTileAt(152, tile.x, tile.y);
                newTile.setCollision(false);
            }
        }

        this.killSpark(spark.body);
    }

	// functions to keep track of inventory
	checkInventory() {
		if (inventory.includes('fire')) {
			inventoryImage.setFrame(1);
		} else if (inventory.includes('water')) {
			inventoryImage.setFrame(2);
		} else if (inventory.includes('electric')) {
			inventoryImage.setFrame(3);
		} else if (inventory.includes('key')) {
			inventoryImage.setFrame(4);
		} else {
			inventoryImage.setFrame(0);
		}
	}

	checkAttack() {
		this.sparks.children.iterate(function(spark) {
			if (inventory.includes('fire')) {
				spark.anims.play('sparkFire');
			} else if (inventory.includes('water')) {
				spark.anims.play('sparkWater');
			} else if (inventory.includes('electric')) {
				spark.anims.play('sparkElectric');
			} else {
				spark.anims.play('sparkDefault');
			}
		})
	}

	dropItem() {
		inventory.pop();
	}


	// additional create functions
	createButtons() {
        // left button
        var leftButton = this.add.image(config.width / 2 - 110, config.height / 2 + 55, 'leftBTN').setScrollFactor(0);
        leftButton.setInteractive();
        leftButton.on('pointerdown', function () {
			if (! paused) {
				moveLeft = true;
			}
        }, this);
        leftButton.on('pointerup', function () {
			if (! paused) {
				moveLeft = false;
			}
        }, this);

        // right button
        var rightButton = this.add.image(config.width / 2 - 80, config.height / 2 + 55, 'rightBTN').setScrollFactor(0);
        rightButton.setInteractive();
        rightButton.on('pointerdown', function () {
			if (! paused) {
				moveRight = true;
			}
        }, this);
        rightButton.on('pointerup', function () {
			if (! paused) {
				moveRight = false;
			}
        }, this);

        // shoot button
        var shootButton = this.add.image(config.width / 2 + 110, config.height / 2 + 30, 'shootBTN').setScrollFactor(0);
        shootButton.setInteractive();
        shootButton.on('pointerdown', this.shoot, this);

        // jump button
        var jumpButton = this.add.image(config.width / 2 + 110, config.height / 2 + 55, 'jumpBTN').setScrollFactor(0);
        jumpButton.setInteractive();
        jumpButton.on('pointerdown', function () {
			if (! paused) {
				jumpUp = true;
			}
        }, this);
        jumpButton.on('pointerup', function () {
			if (! paused) {
				jumpUp = false;
			}
        }, this);

        // inventory button
        var inventoryButton = this.add.image(config.width / 2 + 110, config.height / 2 - 55, 'inventoryBTN', 0).setScrollFactor(0);
        inventoryButton.setInteractive();
        inventoryButton.on('pointerdown', function () {
			if (! paused) {
				this.dropItem();
			}
		}, this );

		// pause button
		var pauseButton = this.add.image(config.width / 2 - 110, config.height / 2 - 55, 'pauseBTN').setScrollFactor(0);
		var pausedText = this.add.image(config.width / 2, config.height / 2, 'paused').setScrollFactor(0).setVisible(false);
		pauseButton.setInteractive();
		pauseButton.on('pointerdown', function() {
			if (paused) {
				pauseButton.setFrame(0);
				paused = false;
				pausedText.setVisible(false);
				this.physics.resume();
			} else {
				pauseButton.setFrame(1);
				paused = true;
				pausedText.setVisible(true);
				this.physics.pause();
			}
		}, this);

		// restart button
		var restartButton = this.add.image(config.width / 2 - 80, config.height / 2 - 55, 'restartBTN').setScrollFactor(0);
		restartButton.setInteractive();
		restartButton.on('pointerdown', function() {
			this.scene.start(this.id);
		}, this);

        this.buttons.add(leftButton, rightButton, shootButton, jumpButton, inventoryButton, pauseButton, restartButton);
    }

	createSparkAnims() {
		this.anims.create({
			key: 'sparkDefault',
			frames: this.anims.generateFrameNumbers('sparks', { frames: [0, 0] }),
			frameRate: 1,
			repeat: -1
		})

		this.anims.create({
			key: 'sparkFire',
			frames: this.anims.generateFrameNumbers('sparks', { frames: [1, 1] }),
			frameRate: 1,
			repeat: -1
		})

		this.anims.create({
			key: 'sparkWater',
			frames: this.anims.generateFrameNumbers('sparks', { frames: [2, 2] }),
			frameRate: 1,
			repeat: -1
		})

		this.anims.create({
			key: 'sparkElectric',
			frames: this.anims.generateFrameNumbers('sparks', { frames: [3, 3] }),
			frameRate: 1,
			repeat: -1
		})
	}

	createEnemyAnims() {
		this.anims.create({
			key: 'fireAnims',
			frames: this.anims.generateFrameNumbers('fireElemental', { frames: [0, 1] }),
			frameRate: 7,
			repeat: -1
		})
    }

    createPortalAnims() {
        this.anims.create({
            key: 'portal',
            frames: this.anims.generateFrameNumbers('portal', { start: 0, end: 2 }),
            frameRate: 7,
            repeat: -1
        })
    }
    
	// function for switching scenes
	switchScene() {
		switch(this.id) {
			case 'sceneA':
				this.scene.start('sceneB');
				break;
			case 'sceneB':
				this.scene.start('sceneA');
				break;
		}
    }

    restartScene() {
        this.scene.start(this.id);
    }
}

class SceneA extends BaseScene {
	constructor() {
		super('sceneA');
		this.tileDataKey = 'level1';
		this.tileDataSource = 'assets/level1.json';
	}

	preload() {
		super.preload();
	}

	create() {
		super.create();
	}

	update(time, delta) {
		super.update(time, delta);
	}
}

class SceneB extends BaseScene {
	constructor() {
        super('sceneB');
        this.tileDataKey = 'level2';
        this.tileDataSource = 'assets/level2.json';
	}

	preload() {
		super.preload();
	}

	create() {
		super.create();
	}

	update(time, delta) {
		super.update(time, delta);
	}
}