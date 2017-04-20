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
const ENEMY_WIDTH = 81;
const PLAYER_WIDTH = 68;

// Game Scores
const LEVEL_UP_SCORES = [
    1000,
    2000,
    3000,
    4000,
    5000,
    6000,
    7000,
    8000,
    9000,
    10000
];

// Default Lives the player has
const DEFAULT_LIVES = 3;

// time limit for each level
const LEVEL1_3 = 30;


// Global Vars
var enemyIndex = 0;
var dead = false;
var levelClearTextPos = 0;


// Jquery Application -> Manipulate Window View
jQuery(function ($) {
    'use strict';
    var openingTimer;

    // template handler
    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });


    // Start view showing some animations until the button pushed
    var moveCharactors = function () {
        $("#start-boy").animate(
            {left: "-=100px"}, 3000)
            .animate({left: "+=100px"}, 3000
            );
        $("#start-enemy").animate(
            {left: "-=100px"}, 3000)
            .animate({left: "+=100px"}, 3000
            );
        $('#start-gem').animate({opacity: "0"}, 3000)
            .animate({opacity: "1.0"}, 3000);

        $('p.start-guide').fadeOut('fast')
            .fadeIn('fast')
            .fadeOut('fast')
            .fadeIn('fast');
    };

    // To start the game!!
    var beginGame = function () {
        $('#countdown').fadeOut('fast');
        $('#game-info').show();

        // to append indicator below canvas
        var indicator = Handlebars.compile($('#indicator-template').html());
        $('body').append(indicator);

        $('.meter-1').animate({opacity: "1"}, 1000, function () {
            $('.meter-2').animate({opacity: "1"}, 1000, function () {
                $('.meter-3').animate({opacity: "1"});
            })
        });

        newEnemies(); // for the first call
        setInterval(newEnemies, ENEMIES_APPEAR_INTERVAL);
    };

    var App = {
        // initialize each section
        init: function () {
            $('#opening').show();
            this.flashAction();
            $('#start').hide();
            $('#countdown').hide();
            $('#end').hide();
            $('#dead').hide();
            this.bindEvents();
        },
        bindEvents: function () {
            console.log('bind-event');
            $('#start-button').on('click', this.start.bind(this));
        },
        // from opening to starting view
        flashAction: function () {
            setTimeout(function () {
                $('#flash').fadeIn('fast', function () {
                    $('#opening').hide();
                    $('#start').show();
                    moveCharactors();
                    openingTimer = setInterval(moveCharactors, 6000)
                }).fadeOut('fast');
            }, 4000);
        },
        getImage: function (row) {
            var imageSources = [
                'images/water-block.png',   // water
                'images/stone-block.png',   // stone
                'images/grass-block.png'    // grass
            ];
            var image = new Image();
            image.src = imageSources[row];
            return image;
        },
        start: function () {
            clearTimeout(openingTimer);
            $('#countdown').slideDown('fast', function () {
                $('#start').hide();
                setTimeout(function () {
                    beginGame();
                }, 4000);
            });
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

// judge Player gets hit by enemy
Enemy.prototype.gotYou = function (player) {
    if ((player.y === PLAYER_1ST_ROW && this.y === ENEMY_1ST_ROW) ||
        (player.y === PLAYER_2ND_ROW && this.y === ENEMY_2ND_ROW) ||
        (player.y === PLAYER_3RD_ROW && this.y === ENEMY_3RD_ROW)
    ) {
        return (collided(player, this));
    } else {
        return false;
    }
}

// To detect collisions between the player and an enemy
function collided(player, enemy) {
    if ((enemy.x < player.x && player.x < (enemy.x + ENEMY_WIDTH)) ||
        enemy.x > player.x && enemy.x < (player.x + PLAYER_WIDTH)
    ) {
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
    this.reachedToTop = false;
    this.currentLevel = 1;
    this.lives = DEFAULT_LIVES;
    this.score = 0;
};

// To reset position values for the Player
Player.prototype.resetPosition = function () {
    this.x = PLAYER_START_X;
    this.y = PLAYER_START_Y;
    this.collided = false;
    this.reachedToTop = false;
}

// To reset all the properties of the player
Player.prototype.reset = function () {
    this.resetPosition();
    this.currentLevel = 1;
}

Player.prototype.update = function () {
    console.log('update called...');
}

Player.prototype.render = function () {
    if (player.collided) {
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
    if(this.reachedToTop) {
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
            if (this.y >= TOP_BORDER) {
                this.y -= ROW_HEIGHT;
            } else if (this.y < TOP_BORDER) {
                this.levelUp();
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
Player.prototype.dead = function (ctx) {
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

Player.prototype.levelUp = function () {
    this.reachedToTop = true;
    if (this.currentLevel === 10) {
        // TODO: GAME Cleared
    } else {
        this.score += LEVEL_UP_SCORES[this.currentLevel - 1]; // adjust index
        this.currentLevel++;
        this.level++;

        // TODO: animate
        $('#current-score').hide();
        $('#current-level').hide();

        $('#current-score').text(('000000' + this.score).slice(-6));
        $('#current-level').text(this.currentLevel);

        $('#current-score').show();
        $('#current-level').show();
    }
}

// New Player -> Just in case I may change the start position randomly
function playerFactory() {
    return new Player(PLAYER_START_X, PLAYER_START_Y);
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
function newEnemies() {
    for (var i = 0; i < ENEMY_ROW_COUNT; i++) {
        allEnemies.push(new Enemy(randomStartX(), randomRow(), randomSpeed()));
    }

    if (allEnemies.length > EXECUTE_DELETE_ENEMIES_COUNT) {
        allEnemies.splice(0, DELETE_ENEMY_COUNT); // to reduce memory use
    }

    var counter = 0;
    $.each($('#game-info h1 span'), function () {
        counter += 1;
        $(this).delay(100 * counter).animate({'opacity': 1}, 1000);
    });
}

function randomStartX() {
    var rnd = Math.random();
    if (rnd > 0.66) {
        return DEFAULT_ENEMY_START_X_POINT;
    } else if (rnd > 0.33) {
        return DEFAULT_ENEMY_START_X_POINT - MOVE_WIDTH;
    } else {
        return DEFAULT_ENEMY_START_X_POINT - MOVE_WIDTH * 2;
    }
}

function randomRow() {
    var rnd = Math.random();
    if (rnd > 0.66) {
        return ENEMY_1ST_ROW;
    } else if (rnd > 0.33) {
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
    allEnemies.forEach(function (enemy) {
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