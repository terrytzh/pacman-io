var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    init: function() {
        game.stage.disableVisibilityChange = true;
    }
};

var game = new Phaser.Game(config);
var pathFinder;


function preload() {
    this.load.image('background', 'assets/images/map.png');
    this.load.image('coltiles', 'assets/images/coltiles.png');
    this.load.image('maze', 'assets/images/maze.png');
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
    this.load.spritesheet('sprites', 'assets/images/sprites32.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sprites2', 'assets/images/sprites.png', { frameWidth: 32, frameHeight: 32 });
}
 



function create() {
    this.PACMAN_VELOCITY = 80;
    this.GHOST_VELOCITY = 75;
    this.GHOST_FEAR_VELOCITY = 60;
    this.GHOST_DEAD_VELOCITY = 120;

    this.add.image(14 * 16, 18 * 16, 'background');
    this.map = this.make.tilemap({ key: 'map' });
    const tileset = this.map.addTilesetImage('coltiles');
    this.layer = this.map.createStaticLayer('MapLayer', tileset);
    this.map.setLayer('MapLayer');
    this.layer.setAlpha(0);
    this.layer.setCollisionByProperty({ collides: true });
    
    this.pathFinder = new EasyStar.js(); //Initialize EasyStar pathFinder
    var mapGrid = [];
    for(var y=0; y < this.map.height; y++){
    	var col = [];
    	for(var x=0; x < this.map.width; x++){
    		var tile = this.map.getTileAt(x, y, true);
    		if(tile == null)
    			col.push(0);
    		else
    			col.push(tile.index);
    	}
    	mapGrid.push(col);
    }
    
    this.pathFinder.setGrid(mapGrid);
    this.pathFinder.setAcceptableTiles([-1, 2, 3, 4, 5, 6]);

    var dotSprites = this.map.createFromTiles(2, null, {key: 'sprites', frame: 100}, this, this.cameras.main, layer='DotLayer');
    var powerDots = this.map.createFromTiles(3, null, {key: 'sprites', frame: 99}, this, this.cameras.main, layer='DotLayer');
    this.physics.world.enable(dotSprites);
    this.physics.world.enable(powerDots);
    for(var i=0; i<dotSprites.length; i++){
    	dotSprites[i].body.setSize(1, 1, true);
    }
    for(var i=0; i<powerDots.length; i++){
    	powerDots[i].body.setSize(12, 12, true);
    }
    this.dots = this.physics.add.group(dotSprites);
    this.dots.incXY(8, 8); //Dot offset
    
    this.powerDots = this.physics.add.group(powerDots);
    this.powerDots.incXY(8, 8);
    
    this.directions = new Array();

    

    this.pacmanMap = {};
    this.ghostMap = {};
    Client.createNewPlayer();

    this.cursors = this.input.keyboard.createCursorKeys();
    
    

    this.anims.create({
        key: 'pacman_move',
        frames: this.anims.generateFrameNumbers('sprites2', { start: 0, end: 2 }),
        frameRate: 15,
        repeat: -1,
        yoyo: true
    });

    this.anims.create({
        key: 'blinky_move_right',
        frames: this.anims.generateFrameNumbers('sprites', { start: 22, end: 23 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'blinky_move_down',
        frames: this.anims.generateFrameNumbers('sprites', { start: 24, end: 25 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'blinky_move_left',
        frames: this.anims.generateFrameNumbers('sprites', { start: 26, end: 27 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'blinky_move_up',
        frames: this.anims.generateFrameNumbers('sprites', { start: 28, end: 29 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'speedy_move_right',
        frames: this.anims.generateFrameNumbers('sprites', { start: 33, end: 34 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'speedy_move_down',
        frames: this.anims.generateFrameNumbers('sprites', { start: 35, end: 36 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'speedy_move_left',
        frames: this.anims.generateFrameNumbers('sprites', { start: 37, end: 38 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'speedy_move_up',
        frames: this.anims.generateFrameNumbers('sprites', { start: 39, end: 40 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'inky_move_right',
        frames: this.anims.generateFrameNumbers('sprites', { start: 44, end: 45 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'inky_move_down',
        frames: this.anims.generateFrameNumbers('sprites', { start: 46, end: 47 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'inky_move_left',
        frames: this.anims.generateFrameNumbers('sprites', { start: 48, end: 49 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'inky_move_up',
        frames: this.anims.generateFrameNumbers('sprites', { start: 50, end: 51 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'clyde_move_right',
        frames: this.anims.generateFrameNumbers('sprites', { start: 55, end: 56 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'clyde_move_down',
        frames: this.anims.generateFrameNumbers('sprites', { start: 57, end: 58 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'clyde_move_left',
        frames: this.anims.generateFrameNumbers('sprites', { start: 59, end: 60 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'clyde_move_up',
        frames: this.anims.generateFrameNumbers('sprites', { start: 61, end: 62 }),
        frameRate: 15,
        repeat: -1,
    })

    this.anims.create({
        key: 'ghost_fear',
        frames: this.anims.generateFrameNumbers('sprites', { start: 77, end: 80 }),
        frameRate: 4,
        repeat: -1,
    })
    
    this.anims.create({
        key: 'ghost_dead',
        frames: this.anims.generateFrameNumbers('sprites', { start: 66, end: 66 }),
        frameRate: 1,
        repeat: -1,
    })
    
    this.anims.create({
        key: 'pacman_dead',
        frames: this.anims.generateFrameNumbers('sprites', { start: 11, end: 21 }),
        frameRate: 11,
        repeat: 0,
    })
}

function update() {
	if(this.player){
		this.player.detectKeyboardInput();
		this.player.update();
	    if(this.player.type === 'ghost'){
	    	for(let i in this.ghostMap){
	    		if(this.ghostMap[i] != this.player){
	    			this.ghostMap[i].calculatePath();
	    			this.ghostMap[i].update();
	    		}
	    	}
	    }
	}
    

}

function detectKeyboardInput() {
	if (this.scene.cursors.left.isDown)
        this.select_direction = Phaser.LEFT;
    else if (this.scene.cursors.right.isDown)
        this.select_direction = Phaser.RIGHT;
    else if (this.scene.cursors.up.isDown)
        this.select_direction = Phaser.UP;
    else if (this.scene.cursors.down.isDown)
        this.select_direction = Phaser.DOWN;
}

function calculatePath() {
	var current_tile = this.current_tile;
	var destination_tile;
	var that = this;
	
	if(this.ghostState == "chase"){
		//Gonna change if multiple pacmans are there
		for(let index in this.scene.pacmanMap){
			destination_tile = this.scene.map.getTileAtWorldXY(this.scene.pacmanMap[index].getCenter().x, this.scene.pacmanMap[index].getCenter().y, true);
		}
	}
	else if(this.ghostState == "scatter" || this.ghostState == "fear"){
		destination_tile = this.scatterpoint;
	}
	else if(this.ghostState == "dead"){
		destination_tile = this.spawnpoint;
	}
	
	if(destination_tile && current_tile){
		this.scene.pathFinder.findPath(current_tile.x, current_tile.y, destination_tile.x, destination_tile.y, function(path){
			
			if(path === null || path.length <= 1){
				//Failsafe; prevent ghost from stucking
				that.directions[Phaser.LEFT] = that.scene.map.getTileAt(current_tile.x - 1, current_tile.y, true);
				that.directions[Phaser.RIGHT] = that.scene.map.getTileAt(current_tile.x + 1, current_tile.y, true);
				that.directions[Phaser.UP] = that.scene.map.getTileAt(current_tile.x, current_tile.y - 1, true);
				that.directions[Phaser.DOWN] = that.scene.map.getTileAt(current_tile.x, current_tile.y + 1, true);
				if(that.directions[that.current_direction].index != -1){
					for(var i = 5; i < 9; i++){
						if(that.last_tile && that.directions[i].x == that.last_tile.x && that.directions[i].y == that.last_tile.y)
							continue;
						if(that.directions[i].index == -1 && 
								i + that.current_direction !== 11 &&
								i + that.current_direction !== 15 && 
								i != that.current_direction)
							that.select_direction = i;
					}
				}
				if(that.ghostState == 'dead')
					that.ghostState = 'scatter';
			}
			else{
				
				
				if(path[1].x === current_tile.x){
					if(path[1].y > current_tile.y)
						that.select_direction = Phaser.DOWN;
					else if(path[1].y < current_tile.y)
						that.select_direction = Phaser.UP;
				}
				else if(path[1].y === current_tile.y){
					if(path[1].x > current_tile.x)
						that.select_direction = Phaser.RIGHT;
					else if(path[1].x < current_tile.x)
						that.select_direction = Phaser.LEFT;
				}
			}
		})
		if(that.last_tile)
			this.scene.pathFinder.avoidAdditionalPoint(that.last_tile.x, that.last_tile.y);
		this.scene.pathFinder.calculate();
		this.scene.pathFinder.stopAvoidingAllAdditionalPoints();
	}
	
	
}

function entityUpdate() {
		
        var x = this.x;
        var y = this.y;
        var angle = this.angle;
        if (this.oldPosition &&
            (x != this.oldPosition.x ||
                y != this.oldPosition.y ||
                angle != this.oldPosition.angle)) {
            Client.updatePlayer({
                x: x,
                y: y,
                angle: angle,
                id: this.id,
                type: this.type,
                animation: this.anims.getCurrentKey()
            });
        }

        this.oldPosition = {
            x: this.x,
            y: this.y,
            angle: this.angle
        };


        //Detect key input, turning point & turn (set current_position to select_direction)
        if(this.x > this.scene.map.widthInPixels){
        	this.setPosition(1, this.y);
        }
        else if(this.x < 0){
        	this.setPosition(this.scene.map.widthInPixels-1, this.y);
        }
        
        this.current_tile = this.scene.map.getTileAtWorldXY(this.getCenter().x, this.getCenter().y, true);
        this.directions[Phaser.LEFT] = this.scene.map.getTileAt(this.current_tile.x - 1, this.current_tile.y, true);
        this.directions[Phaser.RIGHT] = this.scene.map.getTileAt(this.current_tile.x + 1, this.current_tile.y, true);
        this.directions[Phaser.UP] = this.scene.map.getTileAt(this.current_tile.x, this.current_tile.y - 1, true);
        this.directions[Phaser.DOWN] = this.scene.map.getTileAt(this.current_tile.x, this.current_tile.y + 1, true);
        
        if(this.tile_last_frame){
        	if(this.tile_last_frame.x != this.current_tile.x || this.tile_last_frame.y != this.current_tile.y)
        		this.last_tile = this.tile_last_frame;
        }
        
        this.tile_last_frame = this.current_tile;
        
        
        
        //Update velocity according to current_direction
        if (this.type == "pacman") {
        	if(this.isDead){
        		if(this.anims.getProgress() == 1){
        			this.setPosition(this.spawnpoint.x, this.spawnpoint.y);
        			this.current_direction = Phaser.RIGHT;
        			this.select_direction = Phaser.RIGHT;
        			this.anims.play("pacman_move", true);
        			this.setAngle(0);
        			this.isDead = false;
        		}
        		return;
        	}
        	if (this.current_tile.index == 5 &&
                    this.select_direction != this.current_direction &&
                    this.select_direction + this.current_direction != 11 &&
                    this.select_direction + this.current_direction != 15 &&
                    this.directions[this.select_direction] != null &&
                    this.directions[this.select_direction].index != 1) {
                    if (Phaser.Math.Fuzzy.Equal(this.x, this.current_tile.getCenterX(), 1) && Phaser.Math.Fuzzy.Equal(this.y, this.current_tile.getCenterY(), 1)) {
                        this.current_direction = this.select_direction;
                        this.setPosition(this.current_tile.getCenterX(), this.current_tile.getCenterY());
                        this.body.reset(this.current_tile.getCenterX(), this.current_tile.getCenterY()); // Very Important! Reset all precalculated future positions to 0 to prevent update
                    }
                }
            if (this.current_direction == Phaser.LEFT) {
                this.setVelocityY(0);
                this.setVelocityX(-this.scene.PACMAN_VELOCITY);
                this.setAngle(180);
                this.anims.play('pacman_move', true);
            } else if (this.current_direction == Phaser.RIGHT) {
                this.setVelocityY(0);
                this.setVelocityX(this.scene.PACMAN_VELOCITY);
                this.setAngle(0);
                this.anims.play('pacman_move', true);
            } else if (this.current_direction == Phaser.UP) {
                this.setVelocityX(0);
                this.setVelocityY(-this.scene.PACMAN_VELOCITY);
                this.setAngle(270);
                this.anims.play('pacman_move', true);
            } else if (this.current_direction == Phaser.DOWN) {
                this.setVelocityX(0);
                this.setVelocityY(this.scene.PACMAN_VELOCITY);
                this.setAngle(90);
                this.anims.play('pacman_move', true);
            }
        } else if (this.type == "ghost") {
        	if (Phaser.Math.Fuzzy.Equal(this.x, this.current_tile.getCenterX(), 1) && Phaser.Math.Fuzzy.Equal(this.y, this.current_tile.getCenterY(), 1)) {
                    if ((this.current_tile.index == 5 || this.current_tile.index == 6) &&
                            this.select_direction != this.current_direction &&
                            (this.select_direction + this.current_direction) != 11 &&
                            (this.select_direction + this.current_direction) != 15 &&
                            this.directions[this.select_direction] != null &&
                            this.directions[this.select_direction].index != 1) {
                    	//Save the last tile visited
                    	
                        this.current_direction = this.select_direction;
                        this.setPosition(this.current_tile.getCenterX(), this.current_tile.getCenterY());
                        this.body.reset(this.current_tile.getCenterX(), this.current_tile.getCenterY()); // Very Important! Reset all precalculated future positions to 0 to prevent update
                    }
                }
        	if(this.ghostState == 'scatter')
        		this.velocity = this.scene.GHOST_VELOCITY;
        	else if(this.ghostState == 'fear')
        		this.velocity = this.scene.GHOST_FEAR_VELOCITY;
        	else if(this.ghostState == 'dead')
        		this.velocity = this.scene.GHOST_DEAD_VELOCITY;
        	
            if (this.current_direction == Phaser.LEFT) {
                this.setVelocityY(0);
                this.setVelocityX(-this.velocity);
                if(this.ghostState == 'fear')
                	this.anims.play('ghost_fear', true);
                else if(this.ghostState == 'dead')
                	this.anims.play('ghost_dead', true);
                else 
                	this.anims.play(this.ghostType+'_move_left', true);
            } else if (this.current_direction == Phaser.RIGHT) {
                this.setVelocityY(0);
                this.setVelocityX(this.velocity);
                if(this.ghostState == 'fear')
                	this.anims.play('ghost_fear', true);
                else if(this.ghostState == 'dead')
                	this.anims.play('ghost_dead', true);
                else 
                	this.anims.play(this.ghostType+'_move_right', true);
            } else if (this.current_direction == Phaser.UP) {
                this.setVelocityX(0);
                this.setVelocityY(-this.velocity);
                if(this.ghostState == 'fear')
                	this.anims.play('ghost_fear', true);
                else if(this.ghostState == 'dead')
                	this.anims.play('ghost_dead', true);
                else 
                	this.anims.play(this.ghostType+'_move_up', true);
            } else if (this.current_direction == Phaser.DOWN) {
                this.setVelocityX(0);
                this.setVelocityY(this.velocity);
                if(this.ghostState == 'fear')
                	this.anims.play('ghost_fear', true);
                else if(this.ghostState == 'dead')
                	this.anims.play('ghost_dead', true);
                else 
                	this.anims.play(this.ghostType+'_move_down', true);
            }
            
        }
    
}

function setInvincible(isInvincible) {
	this.isInvincible = isInvincible;
}

function eatDot(pacman, dot) {

    dot.destroy();
    Client.removeDot(dot, pacman.id);

    if (this.dots.total === 0) //win
    {
        //this.dots.callAll('revive');
        alert("you won!");
    }

}

function eatPowerDot(pacman, powerDot) {
	powerDot.destroy();
	Client.removeDot(powerDot);
	pacman.setInvincible(true);
	Client.setPacmanInvincible(pacman.id, true);
}

function ghostPacmanCollide(ghost, pacman) {
	if(!pacman.isInvincible){
		if(!pacman.isDead){
			pacman.isDead = true;
			pacman.setVelocity(0);
			pacman.setAngle(0);
			Client.killPacman(pacman.id);
			pacman.anims.play('pacman_dead', true);
		}
	}
	else{
		if(ghost.ghostState != 'dead'){
			ghost.ghostState = 'dead';
			ghost.setVelocity(0);
			Client.killGhost(ghost.id);
			ghost.anims.play('ghost_dead', true);
		}
	}
	
}

function endgame(winner, score) {
	//Sum up the stats and redirect to the page
	var winresult;
	if(winner == game.scene.scenes[0].player.type){
		winresult = 'win';
	}
	else
		winresult = 'loss';
	window.location.replace('http://localhost:8080/Pacman.io/GameEnd?username=<username>&result='+winresult+'&kills='+score+'&deaths=3'+'&score='+score);
}

game.updateKillPacman = function(id){
	this.scene.scenes[0].pacmanMap[id].isDead = true;
	this.scene.scenes[0].pacmanMap[id].setVelocity(0);
	this.scene.scenes[0].pacmanMap[id].setAngle(0);
	this.scene.scenes[0].pacmanMap[id].anims.play('pacman_dead', true);
}

game.updateKillGhost = function(id){
	this.scene.scenes[0].ghostMap[id].ghostState = 'dead';
	this.scene.scenes[0].ghostMap[id].setVelocity(0);
	this.scene.scenes[0].ghostMap[id].anims.play('ghost_dead', true);
}


game.updatePacmanInvincible = function(id, isInvincible){
	if(isInvincible){
		this.scene.scenes[0].pacmanMap[id].isInvincible = true;
		for(let i in this.scene.scenes[0].ghostMap){
			this.scene.scenes[0].ghostMap[i].ghostState = 'fear';
		}
	}
	else{
		this.scene.scenes[0].pacmanMap[id].isInvincible = false;
		for(let i in this.scene.scenes[0].ghostMap){	
			this.scene.scenes[0].ghostMap[i].ghostState = 'scatter';
		}
	}
}

game.addNewPacman = function(x, y, id) {
    console.log(id);
    this.scene.scenes[0].pacmanMap[id] = this.scene.scenes[0].physics.add.sprite(x, y, 'sprites');
    this.scene.scenes[0].pacmanMap[id].spawnpoint = {x: x, y: y};
    this.scene.scenes[0].pacmanMap[id].type = 'pacman';
    this.scene.scenes[0].pacmanMap[id].body.setSize(16, 16, true);
    this.scene.scenes[0].pacmanMap[id].anims.play('pacman_move', true);
    this.scene.scenes[0].physics.add.collider(this.scene.scenes[0].pacmanMap[id], this.scene.scenes[0].layer);
    this.scene.scenes[0].pacmanMap[id].current_direction = Phaser.RIGHT;
    this.scene.scenes[0].pacmanMap[id].select_direction = Phaser.RIGHT;
    this.scene.scenes[0].pacmanMap[id].update = entityUpdate;
    this.scene.scenes[0].pacmanMap[id].processInput = detectKeyboardInput;
    this.scene.scenes[0].pacmanMap[id].detectKeyboardInput = detectKeyboardInput;
    this.scene.scenes[0].pacmanMap[id].directions = {};
    this.scene.scenes[0].pacmanMap[id].id = id;
    this.scene.scenes[0].pacmanMap[id].isDead = false;
    this.scene.scenes[0].pacmanMap[id].isInvincible = false;
    this.scene.scenes[0].pacmanMap[id].setInvincible = setInvincible;
}

game.addNewGhost = function(x, y, id, ghostType, ghostState) {
    console.log(id);
    this.scene.scenes[0].ghostMap[id] = this.scene.scenes[0].physics.add.sprite(x, y, 'sprites');
    this.scene.scenes[0].ghostMap[id].type = 'ghost';
    this.scene.scenes[0].ghostMap[id].ghostType = ghostType;
    this.scene.scenes[0].ghostMap[id].ghostState = ghostState;
    this.scene.scenes[0].ghostMap[id].spawnpoint = this.scene.scenes[0].map.getTileAtWorldXY(x, y, true);
    if(ghostType == "blinky")
    	this.scene.scenes[0].ghostMap[id].scatterpoint = this.scene.scenes[0].map.getTileAt(1, 32);
    else if(ghostType == "speedy")
    	this.scene.scenes[0].ghostMap[id].scatterpoint = this.scene.scenes[0].map.getTileAt(1, 4);
    else if(ghostType == "inky")
    	this.scene.scenes[0].ghostMap[id].scatterpoint = this.scene.scenes[0].map.getTileAt(26, 4);
    else if(ghostType == "clyde")
    	this.scene.scenes[0].ghostMap[id].scatterpoint = this.scene.scenes[0].map.getTileAt(26, 32);
    this.scene.scenes[0].ghostMap[id].body.setSize(16, 16, true);
    this.scene.scenes[0].ghostMap[id].anims.play(ghostType+'_move_right', true);
    this.scene.scenes[0].physics.add.collider(this.scene.scenes[0].ghostMap[id], this.scene.scenes[0].layer);
    for(let index in this.scene.scenes[0].pacmanMap){
    	this.scene.scenes[0].physics.add.overlap(this.scene.scenes[0].ghostMap[id], this.scene.scenes[0].pacmanMap[index], ghostPacmanCollide, null, this.scene.scenes[0]);
	}
    this.scene.scenes[0].ghostMap[id].current_direction = Phaser.UP;
    this.scene.scenes[0].ghostMap[id].select_direction = Phaser.UP;
    this.scene.scenes[0].ghostMap[id].update = entityUpdate;
    this.scene.scenes[0].ghostMap[id].processInput = detectKeyboardInput;
    this.scene.scenes[0].ghostMap[id].calculatePath = calculatePath;
    this.scene.scenes[0].ghostMap[id].detectKeyboardInput = detectKeyboardInput;
    this.scene.scenes[0].ghostMap[id].directions = {};
    this.scene.scenes[0].ghostMap[id].id = id;
}

game.setCurrentPacman = function(index) {
    this.scene.scenes[0].player = this.scene.scenes[0].pacmanMap[index];
    this.scene.scenes[0].physics.add.overlap(this.scene.scenes[0].player, this.scene.scenes[0].dots, eatDot, null, this.scene.scenes[0]);
    this.scene.scenes[0].physics.add.overlap(this.scene.scenes[0].player, this.scene.scenes[0].powerDots, eatPowerDot, null, this.scene.scenes[0]);
}

game.setCurrentGhost = function(index) {
    this.scene.scenes[0].player = this.scene.scenes[0].ghostMap[index];
}

game.removePacman = function(id) {
    this.scene.scenes[0].pacmanMap[id].destroy();
    delete this.scene.scenes[0].pacmanMap[id];
}

game.removeGhost = function(id) {
    this.scene.scenes[0].ghostMap[id].destroy();
    delete this.scene.scenes[0].ghostMap[id];
}

game.removeDot = function(coordinate) {
	for(var i=0; i<game.scene.scenes[0].dots.children.entries.length; i++){
		if(game.scene.scenes[0].dots.children.entries[i].x === coordinate.x && game.scene.scenes[0].dots.children.entries[i].y === coordinate.y){
			game.scene.scenes[0].dots.children.entries[i].destroy();
			return;
		}
	}
	for(var i=0; i<game.scene.scenes[0].powerDots.children.entries.length; i++){
		if(game.scene.scenes[0].powerDots.children.entries[i].x === coordinate.x && game.scene.scenes[0].powerDots.children.entries[i].y === coordinate.y){
			game.scene.scenes[0].powerDots.children.entries[i].destroy();
			return;
		}
	}
}

game.updatePacman = function(otherPlayer) {
    this.scene.scenes[0].pacmanMap[otherPlayer.id].x = otherPlayer.x;
    this.scene.scenes[0].pacmanMap[otherPlayer.id].y = otherPlayer.y;
    this.scene.scenes[0].pacmanMap[otherPlayer.id].angle = otherPlayer.angle;
    this.scene.scenes[0].pacmanMap[otherPlayer.id].anims.play(otherPlayer.animation, true);
}

game.updateGhost = function(otherPlayer) {
    this.scene.scenes[0].ghostMap[otherPlayer.id].x = otherPlayer.x;
    this.scene.scenes[0].ghostMap[otherPlayer.id].y = otherPlayer.y;
    this.scene.scenes[0].ghostMap[otherPlayer.id].anims.play(otherPlayer.animation, true);
    this.scene.scenes[0].ghostMap[otherPlayer.id].anims.play(otherPlayer.animation, true);
}

game.setGhostState = function(id, state) {
	if(this.scene.scenes[0].ghostMap[id].ghostState != 'dead' && this.scene.scenes[0].ghostMap[id].ghostState != 'fear')
		this.scene.scenes[0].ghostMap[id].ghostState = state;
}
