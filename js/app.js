/*
 CONST
 */
// PLAYER
const LEFT = 'left';
const UP = 'up';
const RIGHT = 'right';
const DOWN = 'down';
const PLAYER_START_X = 300;
const PLAYER_START_Y = 407;
const LEFT_BORDER = 0;
const RIGHT_BORDER = 400;
const TOP_BORDER = 0;
const BOTTOM_BORDER = 400;
const PLAYER_1ST_ROW = 71;
const PLAYER_2ND_ROW = 155;
const PLAYER_3RD_ROW = 239;

// ENEMIES
const ENEMY_ROW_COUNT = 3;
const ENEMY_1ST_ROW = 56;
const ENEMY_2ND_ROW = 140;
const ENEMY_3RD_ROW = 224;
const ROW_HEIGHT = 84;
const EXECUTE_DELETE_ENEMIES_COUNT = 20;
const DELETE_ENEMY_COUNT = 5;
const DEFAULT_ENEMY_START_X_POINT = -100;
const ENEMIES_APPEAR_INTERVAL = 3000;
const BASIC_SPEED = 100;
const EXTRA_FAST = 300;
const UNLUCKY_SPEED = 1000;

// ACTIONS
const MOVE_WIDTH = 100;
const PLAYER_HIT_WIDTH = 68;
const PLAYER_HIT_HEIGHT = 80;
const ENEMY_HIT_WIDTH = 99;
const ENEMY_HIT_HEIGHT = 69;
const ENEMY_WIDTH = 101;

// Global Vars
var enemyIndex = 0;
var dead = false;
var deadImageIndex = 0;


// Jquery Application -> Manipulate Window View
jQuery(function($){
    'use strict';
    var openingTimer;
    var openingCounter = 0;
    var startAnimation;
    var moveCharactors= function() {
        $("#start-boy").animate(
            {left: "-=100px"}, 3000)
            .animate({left: "+=100px"}, 3000
            );
        $("#start-enemy").animate(
            {left: "-=100px"}, 3000)
            .animate({left: "+=100px"}, 3000
            );
        $('#start-gem').animate({opacity: "0.1"}, 3000)
            .animate({opacity: "1.0"}, 3000);

    }
    var App = {
        init: function() {
            $('#opening').show();
            this.flashAction();
            $('#start').hide();
            $('#countdown').hide();
            $('#end').hide();
            $('#dead').hide();
            this.bindEvents();

        },
        bindEvents: function(){
            console.log('bind-event');
            $('#start-button').on('click', this.start.bind(this));
        },
        flashAction: function() {
            setTimeout(function(){
               $('#flash').fadeIn('fast', function(){
                   $('#opening').hide();
                   $('#start').show();
                   moveCharactors();
                   setInterval(moveCharactors, 6000)
               }).fadeOut('fast');
            }, 4000);
        },

        getImage: function(row){
            var imageSources = [
                'images/water-block.png',   // water
                'images/stone-block.png',   // stone
                'images/grass-block.png'    // grass
            ];
            var image = new Image();
            image.src = imageSources[row];
            return image;
        },
        start: function(){
            clearTimeout(openingTimer);
            $('#countdown').slideDown('fast', null);
            $('#start').hide();
            this.beginGame();
        },
        renderOpening: function(){

        },
        beginGame: function(){
            //TODO: Count Down and Start the game
            setInterval(newEnemies, ENEMIES_APPEAR_INTERVAL);
        }
    }

    App.init();
});


// Enemies our player must avoid
var Enemy = function (x, y, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x;
    this.y = y;
    this.speed = speed;

    enemyIndex += 1;
    this.index = enemyIndex;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + (dt * this.speed);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.gotYou = function (player) {
    if((player.y == PLAYER_1ST_ROW && this.y == ENEMY_1ST_ROW) ||
        (player.y == PLAYER_2ND_ROW && this.y == ENEMY_2ND_ROW) ||
        (player.y == PLAYER_3RD_ROW && this.y == ENEMY_3RD_ROW)
    ) {
        return (collided(player, this));
    } else {
        return false;
    }
}

function collided(player, enemy) {
    if(enemy.x < player.x && player.x < (enemy.x + ENEMY_WIDTH)) {
        console.log('OUT!!!');
        player.collided = true;
        return true;
    } else {
        return false;
    }
}


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (x, y) {
    this.sprite = "images/char-boy.png";
    this.died_sprite = "images/dead-boy.png";
    this.x = x;
    this.y = y;
    this.collided = false;
};

Player.prototype.update = function () {
    console.log('update called...');
}

Player.prototype.render = function () {
    if(player.collided) {
        ctx.drawImage(Resources.get(this.died_sprite), this.x, this.y);
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// Control Player
Player.prototype.handleInput = function (keyInfo) {
    if (dead) {
        dead = false;
        return;
    }
    switch (keyInfo) {
        case LEFT:
            if (this.x > LEFT_BORDER) {
                this.x -= MOVE_WIDTH;
            }
            break;
        case RIGHT:
            if (this.x < RIGHT_BORDER) {
                this.x += MOVE_WIDTH;
            }
            break;
        case UP:
            if (this.y > TOP_BORDER) {
                this.y -= ROW_HEIGHT;
            }
            break;
        case DOWN:
            if (this.y < BOTTOM_BORDER) {
                this.y += ROW_HEIGHT;
            }
            break;
        default:
            break;
    }
    console.log('##################');
    console.log(this.y);
}

// dead after collision
Player.prototype.dead = function(ctx) {
    //ctx.drawImage(Resources.get('images/boy_dead_5.png'), 19, 552.5);
    ctx.font = '23pt Arial';
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 6;
    // ctx.strokeText(player.lives, 89, 575);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    // ctx.fillText(player.lives, 89, 575);
    /* Use the browser's requestAnimationFrame function to call this
     * function again as soon as the browser is able to draw another frame.
     */
    this.collided = false;
}



// New Player -> Just in case I may change the start position randomly
function playerFactory() {
    return new Player(PLAYER_START_X, PLAYER_START_Y);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
function newEnemies() {
    for(var i = 0; i < ENEMY_ROW_COUNT; i++) {
        allEnemies.push(new Enemy(randomStartX(), randomRow(), randomSpeed()));
    }

    if (allEnemies.length > EXECUTE_DELETE_ENEMIES_COUNT) {
        allEnemies.splice(0, DELETE_ENEMY_COUNT); // to reduce memory use
    }
}
function randomStartX () {
    var rnd = Math.random();
    if (rnd > 0.66) {
        return DEFAULT_ENEMY_START_X_POINT;
    } else if(rnd > 0.33) {
        return DEFAULT_ENEMY_START_X_POINT - MOVE_WIDTH;
    } else {
        return DEFAULT_ENEMY_START_X_POINT - MOVE_WIDTH * 2;
    }
}
function randomRow() {
    var rnd = Math.random();
    if (rnd > 0.66) {
        return ENEMY_1ST_ROW;
    } else if(rnd > 0.33) {
        return ENEMY_2ND_ROW;
    } else {
        return ENEMY_3RD_ROW;
    }
}
function randomSpeed() {
    if (Math.random() > 0.9) {
        return UNLUCKY_SPEED; // LOL...
    } else if (Math.random() > 0.7) {
        return EXTRA_FAST;
    } else {
        return (Math.random() + 1) * BASIC_SPEED;
    }
}

// Place the player object in a variable called player
var player = playerFactory();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: LEFT,
        38: UP,
        39: RIGHT,
        40: DOWN
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

function checkCollisions() {
    allEnemies.forEach(function(enemy){
        if (enemy.gotYou(player)) {
            dead = true;
            return true;
        }
    });
    return false;
}

function sleep(milliSeconds) {
    var time = new Date().getTime();
    while (new Date().getTime() < time + milliSeconds);
}