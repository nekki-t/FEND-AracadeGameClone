/*
 var
 */
// PLAYER
var LEFT = 'left';
var UP = 'up';
var RIGHT = 'right';
var DOWN = 'down';
var PLAYER_START_X = 300;
var PLAYER_START_Y = 407;
var LEFT_BORDER = 0;
var RIGHT_BORDER = 400;
var TOP_BORDER = 0;
var BOTTOM_BORDER = 400;
var PLAYER_1ST_ROW = 71;
var PLAYER_2ND_ROW = 155;
var PLAYER_3RD_ROW = 239;

// ENEMIES
var ENEMY_1ST_ROW = 56;
var ENEMY_2ND_ROW = 140;
var ENEMY_3RD_ROW = 224;
var ROW_HEIGHT = 84;
var DELETE_ENEMY_COUNT = 5;
var DEFAULT_ENEMY_START_X_POINT = -100;
var BASIC_SPEED = 100;
var EXTRA_FAST = 300;
var UNLUCKY_SPEED = 1000;

// related to difficulties
var ENEMY_ROW_COUNT = 3;
var EXECUTE_DELETE_ENEMIES_COUNT = 20;
var ENEMIES_APPEAR_INTERVAL = 3000;

// ACTIONS
var MOVE_WIDTH = 100;
var PLAYER_HIT_WIDTH = 68;
var PLAYER_HIT_HEIGHT = 80;
var ENEMY_HIT_WIDTH = 99;
var ENEMY_HIT_HEIGHT = 69;
var ENEMY_WIDTH = 81;
var PLAYER_WIDTH = 68;

var MESSAGE_SIZE = 25;

// Game Scores
var LEVEL_UP_SCORES = [
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
var DEFAULT_LIVES = 3;

// time limit for each level
var TIME_LIMIT_TO_CLEAR_A_LEVEL = 30;
var LEVEL1_3 = 30;
var CHAR_1_LEVEL = 2;


// Global Vars
var allEnemies = [];
var enemyIndex = 0;
var dead = false;
var levelClearTextPos = 0;
var deadTextPos = 0;
var withSound = false;
var timeLimit = TIME_LIMIT_TO_CLEAR_A_LEVEL;
var levelTimer;
var timeOut = false;

/**
 * @description jQuery functions -> to manipulate DOM other than canvas
 */
jQuery(function ($) {
  'use strict';
  var openingTimer;

  // template handler
  Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Start view showing some animations until the button pushed
  var moveCharactors = function () {
    var MOVING_TIME = 3000;
    $("#start-boy").animate(
      {left: "-=100px"}, MOVING_TIME)
      .animate({left: "+=100px"}, MOVING_TIME
      );
    $("#start-enemy").animate(
      {left: "-=100px"}, MOVING_TIME)
      .animate({left: "+=100px"}, MOVING_TIME
      );
    $('#start-gem').animate({opacity: "0"}, MOVING_TIME)
      .animate({opacity: "1.0"}, MOVING_TIME);

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
    meterReset();

    if (withSound) {
      var sound = new Howl({
        src: ['sounds/bgm.mp3']
      });
      sound.play();
    }

    newEnemies(); // for the first call
    setInterval(newEnemies, ENEMIES_APPEAR_INTERVAL);
    levelTimer = setInterval(countDownForEachLevel, 1000);
  };

  // jQuery App
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
      $('#start-button-with-sounds').on('click', this.start.bind(this));
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
    start: function (e) {
      withSound = ($(e.target).attr('id') == 'start-button-with-sounds');
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

/**
 * @description Enemies our player must avoid
 * @param {integer} x - x position
 * @param {integer} y - y position
 * @param {integer} speed - speed to move enemy
 */
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

/**
 * @description Update the enemy's position, required method for game
 * @param {number} number - a time delta between ticks
 */
Enemy.prototype.update = function (dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  // if the player is collided, wait seconds for message shown
  if (player.collided) {
    return;
  }
  this.x = this.x + (dt * this.speed);
};

/**
 * @description Draw the enemy on the screen, required method for game
 */
Enemy.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description judge if player is in the target area of a enemy
 * @param {player} player - current player instance
 */
Enemy.prototype.inTarget = function (player) {
  if ((player.y === PLAYER_1ST_ROW && this.y === ENEMY_1ST_ROW) ||
    (player.y === PLAYER_2ND_ROW && this.y === ENEMY_2ND_ROW) ||
    (player.y === PLAYER_3RD_ROW && this.y === ENEMY_3RD_ROW)
  ) {
    return (collided(player, this));
  } else {
    return false;
  }
};

// To detect collisions between the player and an enemy
/**
 * @description judge if player is collided with an enemy
 * @param {player} player - current player instance
 * @param {enemy} enemy - an enemy instance
 */
function collided(player, enemy) {
  if ((enemy.x < player.x && player.x < (enemy.x + ENEMY_WIDTH)) ||
    enemy.x > player.x && enemy.x < (player.x + PLAYER_WIDTH)
  ) {
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
  this.sprite1 = "images/char-boy.png";
  this.sprite2 = "images/char-pink-girl.png";
  this.sprite3 = "images/char-cat-girl.png";
  this.sprite4 = "images/char-horn-girl.png";
  this.sprite5 = "images/char-princess-girl.png";
  this.currentSprite = this.sprite1;

  this.dead_sprite1 = "images/boy-dead.png";
  this.dead_sprite2 = "images/pink-girl-dead.png";
  this.dead_sprite3 = "images/cat-girl-dead.png";
  this.dead_sprite4 = "images/horn-girl-dead.png";
  this.dead_sprite5 = "images/princess-girl-dead.png";
  this.currentDeadSprite = this.dead_sprite1;

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

// updating player view
Player.prototype.update = function () {
  console.log('update called...');
}

// lose life after collision
Player.prototype.loseLife = function () {
  player.lives -= 1;
  if (player.lives > 0) {
    $('#lives').text('x ' + player.lives.toString());
    player.resetPosition();
  } else {
    // TODO: GameOver
    console.log('Game Over')
  }
};

// show player
Player.prototype.render = function () {
  if (player.collided) {
    // TODO: switch by player's char
    ctx.drawImage(Resources.get(this.dead_sprite1), this.x, this.y);
  } else {
    // TODO: switch by player's char
    ctx.drawImage(Resources.get(this.sprite1), this.x, this.y);
  }

  // player succeeded in reaching to the top
  if (player.reachedToTop) {
    ctx.font = MESSAGE_SIZE.toString() + 'pt Impact';
    ctx.lineWidth = 10;

    ctx.strokeStyle = 'red';
    ctx.strokeText(1000 + ' Up', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - levelClearTextPos)

    ctx.fillStyle = 'yellow';
    ctx.fillText(1000 + ' Up', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - levelClearTextPos);

    levelClearTextPos += 1;
    if (levelClearTextPos > 30) {
      levelClearTextPos = 0;
      player.resetPosition();
    }
  }

  // player is dead...
  if (player.collided) {

    ctx.font = MESSAGE_SIZE.toString() + 'pt Passion';
    ctx.lineWidth = 10;

    ctx.strokeStyle = 'white';
    ctx.strokeText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - deadTextPos)

    ctx.fillStyle = 'red';
    ctx.fillText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - deadTextPos);

    deadTextPos += 1;
    if (deadTextPos > 80) {
      deadTextPos = 0;
      player.loseLife();
    }
  }

  if(timeOut) {
    ctx.font = MESSAGE_SIZE.toString() + 'pt Passion';
    ctx.lineWidth = 10;

    ctx.strokeStyle = 'white';
    ctx.strokeText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - deadTextPos)

    ctx.fillStyle = 'red';
    ctx.fillText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + 50 - deadTextPos);

    deadTextPos += 1;
    if (deadTextPos > 80) {
      deadTextPos = 0;
      player.loseLife();
      clearInterval(levelTimer);
      timeLimit = TIME_LIMIT_TO_CLEAR_A_LEVEL;
      timeOut = false;
      levelTimer = setInterval(countDownForEachLevel, 1000);
      meterReset();
    }
  }
};

// Control Player
Player.prototype.handleInput = function (keyInfo) {
  if (dead) {
    dead = false;
    return;
  }
  if (this.reachedToTop) {
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
        if (this.y < TOP_BORDER) {
          this.levelUp();
        }
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
}

// player's level is to be up
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

    $('#current-score').text(('0000000' + this.score).slice(-7));
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
function newEnemies() {
  for (var i = 0; i < ENEMY_ROW_COUNT; i++) {
    allEnemies.push(new Enemy(randomStartX(), randomRow(), randomSpeed()));
  }

  if (allEnemies.length > EXECUTE_DELETE_ENEMIES_COUNT) {
    allEnemies.splice(0, DELETE_ENEMY_COUNT); // to reduce memory use
  }

  var counter = 0;
  // show level info with animation
  $.each($('#game-info h1 span'), function () {
    counter += 1;
    $(this).delay(100 * counter).animate({'opacity': 1}, 300);
  });
}

// allocate enemies x-position randomly
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

// allocate enemies in rows randomly
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

// To make more fun, I change enemy's speed randomly
function randomSpeed() {
  if (Math.random() > 0.9) {
    return UNLUCKY_SPEED; // LOL...
  } else if (Math.random() > 0.7) {
    return EXTRA_FAST;
  } else {
    return (Math.random() + 1) * BASIC_SPEED;
  }
}

// generate new instance for player to start
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
    if (enemy.inTarget(player)) {
      dead = true;
      return true;
    }
  });
  return false;
}

function countDownForEachLevel () {
  timeLimit -= 1;
  var meter = parseInt(timeLimit * 10 / TIME_LIMIT_TO_CLEAR_A_LEVEL) + 2;
  $('.meter-' + meter.toString()).css('opacity', '');

  if(meter < 8 && meter >= 5) {
    $('.meter').css('background-color', 'yellow');
  } else if(meter < 5 && meter >= 1) {
    $('.meter').css('background-color', 'red');
  } else if(meter < 1) {
    timeOut = true;
  }
}

function meterReset () {
  $('.meter').css('background-color', 'deepskyblue');
  var showMeterInterval = 100;
  $('.meter-1').animate({opacity: "1"}, showMeterInterval, function () {
    $('.meter-2').animate({opacity: "1"}, showMeterInterval, function () {
      $('.meter-3').animate({opacity: "1"}, showMeterInterval, function () {
        $('.meter-4').animate({opacity: "1"}, showMeterInterval, function () {
          $('.meter-5').animate({opacity: "1"}, showMeterInterval, function () {
            $('.meter-6').animate({opacity: "1"}, showMeterInterval, function () {
              $('.meter-7').animate({opacity: "1"}, showMeterInterval, function () {
                $('.meter-8').animate({opacity: "1"}, showMeterInterval, function () {
                  $('.meter-9').animate({opacity: "1"}, showMeterInterval, function () {
                    $('.meter-10').animate({opacity: "1"}, showMeterInterval), function() {
                    };
                  });
                });
              });
            });
          });
        });
      });
    })
  });
}