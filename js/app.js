/**
 * @description CONSTANS
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
var CHAR_LEVEL_2 = 5;
var CHAR_LEVEL_3 = 10;
var CHAR_LEVEL_4 = 20;
var CHAR_LEVEL_5 = 30;

// Game Fields
var ENEMY_1ST_ROW = 56;
var ENEMY_2ND_ROW = 140;
var ENEMY_3RD_ROW = 224;
var ROW_HEIGHT = 84;
var DELETE_ENEMY_COUNT = 5;
var DEFAULT_ENEMY_START_X_POINT = -100;

// related to difficulties
var BASIC_SPEED = 100;
var BASIC_SPEED_UP = 2;
var EXTRA_FAST = 300;
var UNLUCKY_SPEED = 1000;
var ENEMY_ROW_COUNT = 3;
var UNLUCKY_LEVEL = 0.95;
var EXTRA_FAST_LEVEL = 0.8;

var ENEMIES_APPEAR_INTERVAL = 3000;
var EXECUTE_DELETE_ENEMIES_COUNT = 50;

// Figure info
var MOVE_WIDTH = 100;
var PLAYER_HIT_HEIGHT = 80;
var ENEMY_WIDTH = 81;
var PLAYER_WIDTH = 68;

var MESSAGE_SIZE = 25;
var MESSAGE_Y_POS_ADJUSTMENT = 80;

// Game Scores and items
var SCORE_FORMAT = '0000000';
var BASIC_SCORE = 500;
var GEM_SCORE_ORANGE = 10000;
var GEM_SCORE_GREEN = 5000;
var GEM_SCORE_BLUE = 1000;
var GEM_COLOR_ORANGE = 'Orange';
var GEM_COLOR_GREEN = 'Green';
var GEM_COLOR_BLUE = 'Blue';
var RATE_ORANGE_GEM_APPEAR = 0.3;
var RATE_GREEN_GEM_APPEAR = 0.5;
var RATE_HEART_APPEAR = 0.2;
var STAR_APPEAR_LEVEL = CHAR_LEVEL_4;
var RATE_STAR_APPEAR = 0.4;
var SUPER_MODE_COUNT_START = 3;

// Default Lives the player has
var DEFAULT_LIVES = 3;

// time limit for each level
var TIME_LIMIT_TO_CLEAR_A_LEVEL = 10;
var TIME_OUT_TICKING = 1000;

// General
var INVALID_NUM = -1000;
var LOCAL_STORAGE_NAMESPACE = 'ARCADE_GAME';

var VOLUME = 0.5;

/**
 * @description Global Variables
*/
var allEnemies = [];
var gems = [];
var heart;
var star;
var gotHeartTextY = INVALID_NUM;
var gotHeartTextX = INVALID_NUM;
var gotStarTextY = INVALID_NUM;
var gotStarTextX = INVALID_NUM;

var currentBasicSpeed = BASIC_SPEED;
var currentEnemyRowCount = ENEMY_ROW_COUNT;
var currentEnemyAppearInterval = ENEMIES_APPEAR_INTERVAL;

var enemyIndex = 0;
var dead = false;
var levelClearTextPos = 0;
var gotHeartTextPos = 0;
var gotStarTextPos = 0;
var deadTextPos = 0;
var withSound = false;
var timeLimit = TIME_LIMIT_TO_CLEAR_A_LEVEL;
var countDownTimer;
var levelTimer;
var enemiesTimer;

var isGameOver = false;

// sounds
var mainBGM;
var superModeBGM;
var countDownBGM;
var gameOverBGM;
var hitSound;
var hitSoundSuperMode;
var levelUpSound;
var itemSound;
var timeoutSound;

/**
 * @description
 * - initialize sounds
*/
function initSound () {
  mainBGM = new Howl({
    src: ['sounds/bgm.mp3'],
    volume: VOLUME
  });

  superModeBGM = new Howl({
    src: ['sounds/bgmSuperMode.mp3'],
    volume: VOLUME
  });

  countDownBGM = new Howl({
    src:['sounds/countDown.mp3'],
    loop: false,
    volume: VOLUME
  });

  gameOverBGM = new Howl({
    src:['sounds/gameOver.mp3'],
    loop: false,
    volume: VOLUME
  });

  hitSound = new Howl({
    src:['sounds/hit.mp3'],
    loop: false,
    volume: VOLUME
  });

  hitSoundSuperMode = new Howl({
    src:['sounds/hitSuperMode.mp3'],
    loop: false,
    volume: VOLUME
  });

  levelUpSound = new Howl({
    src:['sounds/levelUp.mp3'],
    loop: false,
    volume: VOLUME
  });

  itemSound = new Howl({
    src:['sounds/getItem.mp3'],
    loop: false,
    volume: VOLUME
  });

  timeoutSound = new Howl({
    src:['sounds/timeout.mp3'],
    loop: false,
    volume: VOLUME
  });
}

initSound();

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
    clearTimeout(countDownTimer);

    $('#countdown').fadeOut('fast');
    $('#current-score').text((SCORE_FORMAT + '0').slice(-SCORE_FORMAT.length));
    $('#game-info').show();

    // to append indicator below canvas
    var indicator = Handlebars.compile($('#indicator-template').html());
    $('body').append(indicator);

    withSound && mainBGM.play();

    showLevelInfo();
    newEnemies(); // only for the first call
    enemiesTimer = setInterval(newEnemies, ENEMIES_APPEAR_INTERVAL);
    placeItems();
    meterReset();
  };

  // jQuery App
  var App = {
    // initialize each section
    init: function () {
      $('#opening').show();
      this.flashAction();
      $('#start').hide();
      $('#countdown').hide();
      $('#game-over').hide();
      this.bindEvents();
    },
    bindEvents: function () {
      $('#start-button').on('click', this.start.bind(this));
      $('#start-button-with-sounds').on('click', this.start.bind(this));
      $('#restart-button').on('click', this.restart.bind(this));
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
      withSound = ($(e.target).attr('id') === 'start-button-with-sounds');
      clearInterval(openingTimer);
      $('#countdown').slideDown('fast', function () {
        withSound && countDownBGM.play();
        $('#start').hide();
        countDownTimer = setTimeout(function () {
          beginGame();
        }, 4000);
      });
    },
    restart: function() {
      location.reload(); // simplest way to refresh
    }
  };

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
  if (player.collided || player.timeOut) {
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
 * @description
 * judge if player is in the target area of a enemy
 */
Enemy.prototype.inTarget = function () {
  if ((player.y === PLAYER_1ST_ROW && this.y === ENEMY_1ST_ROW) ||
    (player.y === PLAYER_2ND_ROW && this.y === ENEMY_2ND_ROW) ||
    (player.y === PLAYER_3RD_ROW && this.y === ENEMY_3RD_ROW)
  ) {
    return (collided(this));
  } else {
    return false;
  }
};

/**
 * @description
 * judge if player is collided with an enemy
 * @param {enemy} enemy - an enemy instance
 */
function collided(enemy) {
  if ((enemy.x < player.x && player.x < (enemy.x + ENEMY_WIDTH)) ||
    enemy.x > player.x && enemy.x < (player.x + PLAYER_WIDTH)
  ) {
    if(!player.collided) {
      if(player.superModeCount > 0) {
        withSound && !hitSoundSuperMode.playing() && hitSoundSuperMode.play();
        return false; // when superMode, no collisions
      }
      withSound && hitSound.play();
    }
    player.collided = true;
    return true;
  } else {
    return false;
  }
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
/**
 * @description
 * Player Class
 * @param {integer} x - default x position
 * @param {integer} y - default y position
 */
var Player = function (x, y) {
  this.sprite1 = 'images/char-boy.png';
  this.sprite2 = 'images/char-pink-girl.png';
  this.sprite3 = 'images/char-cat-girl.png';
  this.sprite4 = 'images/char-horn-girl.png';
  this.sprite5 = 'images/char-princess-girl.png';
  this.spriteSuperModeHorn = 'images/super-horn.png';
  this.spriteSuperModePrincess = 'images/super-princess.png';

  this.dead_sprite1 = 'images/boy-dead.png';
  this.dead_sprite2 = 'images/pink-girl-dead.png';
  this.dead_sprite3 = 'images/cat-girl-dead.png';
  this.dead_sprite4 = 'images/horn-girl-dead.png';
  this.dead_sprite5 = 'images/princess-girl-dead.png';

  this.x = x;
  this.y = y;

  // status for rendering
  this.collided = false;
  this.timeOut = false;
  this.reachedToTop = false;
  this.gotHeart = false;
  this.gotStar = false;
  this.superModeCount = 0;

  // score info
  this.currentLevel = 1;
  this.lives = DEFAULT_LIVES;
  this.score = 0;
};

/**
 * @description
 * reset player's position to default
 */
Player.prototype.resetPosition = function () {
  this.x = PLAYER_START_X;
  this.y = PLAYER_START_Y;
  this.collided = false;
  this.reachedToTop = false;
  this.timeOut = false;
  this.gotHeart = false;
};

/**
 * @description
 * updating player view :NOP..
 */
Player.prototype.update = function () {
  console.log('update called...');
};

/**
 * @description
 * losing a life after collision.
 * if there is no more life, game over.
*/
Player.prototype.loseLife = function () {
  this.lives -= 1;
  if (this.lives > 0) {
    $('#lives').text('x ' + this.lives.toString());
    player.resetPosition();
    meterReset();
  } else {
    if(!isGameOver) {
      isGameOver = true;
      stopTimers();
      gameOver();
    }
  }
};

/**
 * @description
 * rendering player depending on settings or status
*/
Player.prototype.render = function () {
  if (this.collided || this.timeOut) {
    this.renderDeadSprite();
  } else {
    this.renderSprite();
  }

  // player succeeded in reaching to the top
  if (this.reachedToTop) {
    this.renderLevelUp();
  }
  if (this.collided) {
    this.renderCollision();
  }
  if (this.timeOut) {
    this.renderTimeout();
  }
  if (this.gotHeart) {
    this.renderGotHeart();
  }
  if (this.gotStar) {
    this.renderStar();
  }
  this.renderGotGem();
};

/**
 * @description
 * - render after player got a gem
*/
Player.prototype.renderGotGem = function() {
  ctx.font = MESSAGE_SIZE.toString() + 'pt Impact';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'lime';

  gems.forEach(function(gem, index) {
    if(gem.caughtByPlayer) {
      ctx.strokeText(gem.score + ' Up', gem.hitPosX, gem.hitPosY + MESSAGE_Y_POS_ADJUSTMENT - gem.messagePos);
      ctx.fillText(gem.score + ' Up', gem.hitPosX, gem.hitPosY + MESSAGE_Y_POS_ADJUSTMENT - gem.messagePos);
      gem.messagePos += 1;
      if(gem.messagePos > 20) {
        gems.splice(index, 1);
        $('#current-score').text((SCORE_FORMAT + player.score).slice(-SCORE_FORMAT.length));
      }
    }
  });
};

/**
 * @description
 * - render when player gets a star
*/
Player.prototype.renderStar = function() {
  if(gotStarTextX === INVALID_NUM || gotStarTextY === INVALID_NUM) {
    gotStarTextX = this.x;
    gotStarTextY = this.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT;
  }

  ctx.font = MESSAGE_SIZE.toString() + 'pt Impact';
  ctx.lineWidth = 3;

  ctx.strokeStyle = 'yellow';
  ctx.strokeText('Start Super Mode!!', gotHeartTextX, gotHeartTextY - gotHeartTextPos);

  ctx.fillStyle = 'red';
  ctx.fillText('Start Super Mode!!', gotHeartTextX, gotHeartTextY - gotHeartTextPos);

  gotStarTextPos += 1;
  if (gotStarTextPos > 20) {
    this.gotStar = false;
    gotStarTextX = INVALID_NUM;
    gotStarTextY = INVALID_NUM;
    gotStarTextPos = 0;
  }
};

/**
 * @description
 * - render when player gets a heart
*/
Player.prototype.renderGotHeart = function() {
  if (gotHeartTextX === INVALID_NUM || gotHeartTextY === INVALID_NUM) {
    gotHeartTextX = this.x;
    gotHeartTextY = this.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT;
  }

  ctx.font = MESSAGE_SIZE.toString() + 'pt Impact';
  ctx.lineWidth = 3;

  ctx.strokeStyle = 'yellow';
  ctx.strokeText('+ 1', gotHeartTextX, gotHeartTextY - gotHeartTextPos);

  ctx.fillStyle = 'red';
  ctx.fillText('+ 1', gotHeartTextX, gotHeartTextY - gotHeartTextPos);

  gotHeartTextPos += 1;
  if (gotHeartTextPos > 20) {
    this.gotHeart = false;
    gotHeartTextY = INVALID_NUM;
    gotHeartTextX = INVALID_NUM;
    gotHeartTextPos = 0;
    $('#lives').text('x ' + this.lives.toString());
  }
};

/**
 * @description
 * - render when player gets timeout
*/
Player.prototype.renderTimeout = function() {
  this.renderDeadText();

  deadTextPos += 1;
  if (deadTextPos > 60) {
    deadTextPos = 0;
    this.loseLife();
  }
};

/**
 * @description
 * - render when player gets hit by an enemy
*/
Player.prototype.renderCollision = function () {
  this.renderDeadText();

  deadTextPos += 1;
  if (deadTextPos > 60) {
    deadTextPos = 0;
    this.loseLife();
  }
};

/**
 * @description
 * - render text information about death of player
*/
Player.prototype.renderDeadText = function () {
  ctx.font = MESSAGE_SIZE.toString() + 'pt Passion';
  ctx.lineWidth = 3;

  ctx.strokeStyle = 'white';
  ctx.strokeText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT - deadTextPos);

  ctx.fillStyle = 'red';
  ctx.fillText('DEAD...', player.x, player.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT - deadTextPos);
};

/**
 * @description
 * - render when player reached to the top -> level up
*/
Player.prototype.renderLevelUp = function () {
  ctx.font = MESSAGE_SIZE.toString() + 'pt Impact';
  ctx.lineWidth = 3;

  var scoreText = BASIC_SCORE * (this.currentLevel - 1); // must be calculated by previous level

  ctx.strokeStyle = 'red';
  ctx.strokeText(scoreText + ' Up', this.x, this.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT - levelClearTextPos)

  ctx.fillStyle = 'yellow';
  ctx.fillText(scoreText + ' Up', this.x, this.y + PLAYER_HIT_HEIGHT + MESSAGE_Y_POS_ADJUSTMENT - levelClearTextPos);

  levelClearTextPos += 1;
  if (levelClearTextPos > 30) {
    levelClearTextPos = 0;
    this.resetPosition();
    meterReset();
  }
};

/**
 * @description
 * - render player's sprite character depends on player's level
*/
Player.prototype.renderSprite = function() {
  var image = this.sprite1;
  if(this.superModeCount > 0) {
    if (this.currentLevel >= CHAR_LEVEL_4 && this.currentLevel < CHAR_LEVEL_5) {
      image = this.spriteSuperModeHorn;
    } else if (this.currentLevel >= CHAR_LEVEL_5){
      image = this.spriteSuperModePrincess;
    }
  } else if (this.currentLevel >= CHAR_LEVEL_2 && this.currentLevel < CHAR_LEVEL_3) {
    image = this.sprite2;
  } else if(this.currentLevel >= CHAR_LEVEL_3 && this.currentLevel < CHAR_LEVEL_4) {
    image = this.sprite3;
  } else if(this.currentLevel >= CHAR_LEVEL_4 && this.currentLevel < CHAR_LEVEL_5) {
    image = this.sprite4;
  } else if (this.currentLevel >= CHAR_LEVEL_5) {
    image = this.sprite5;
  }
  ctx.drawImage(Resources.get(image), this.x, this.y);
};

/**
 * @description
 * - render player's dead sprite character depends on player's level
 */
Player.prototype.renderDeadSprite = function() {
  var image = this.dead_sprite1;
  if (this.currentLevel >= CHAR_LEVEL_2 && this.currentLevel < CHAR_LEVEL_3) {
    image = this.dead_sprite2;
  } else if(this.currentLevel >= CHAR_LEVEL_3 && this.currentLevel < CHAR_LEVEL_4) {
    image = this.dead_sprite3;
  } else if(this.currentLevel >= CHAR_LEVEL_4 && this.currentLevel < CHAR_LEVEL_5) {
    image = this.dead_sprite4;
  } else if (this.currentLevel >= CHAR_LEVEL_5) {
    image = this.dead_sprite5;
  }
  ctx.drawImage(Resources.get(image), this.x, this.y);
};

/**
 * @description
 * Control player by KeyInfo
 * @param {string} keyInfo - string key information -> up down left right
*/
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
  checkGetItem();
};

/**
 * @description
 *  player's level is to be up
*/
Player.prototype.levelUp = function () {
  this.reachedToTop = true;
  if(player.superModeCount > 0) {
    player.superModeCount -= 1;
    if (withSound && player.superModeCount == 0) {
      mainBGM.play();
      superModeBGM.stop();
    }
  }

  withSound && levelUpSound.play();

  this.score += BASIC_SCORE * this.currentLevel;
  this.currentLevel++;
  moreDifficult(this.currentLevel);
  placeItems();

  $('#current-score').hide();
  $('#current-level').hide();

  $('#current-score').text((SCORE_FORMAT + this.score).slice(-SCORE_FORMAT.length));
  $('#current-level').text(this.currentLevel);

  $('#current-score').show();
  $('#current-level').show();

};

/**
 * @description
 * - Heart Class -> enables player to increase life count
 * @param {integer} x - x position to be displayed
 * @param {integer} y - y position to be displayed
*/
var Heart = function(x, y) {
  this.x = x;
  this.y = y + 10; // adjust to fit in a block
  this.orgY = y; //same measurement as player's y
  this.isShown = false;
  this.sprite = 'images/Heart.png';
};

/**
 * @description
 * - render heat image
*/
Heart.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description
 * - Class for Gems to get higher scores which are placed randomly
 * @param {integer} x - x position to be displayed
 * @param {integer} y - y position to be displayed
 * @param {string} color - color of gem to instanciate
*/
var Gem = function(x, y, color) {
  this.x = x;
  this.y = y - 10; // adjust
  this.orgY = y;
  this.hitPosX = null;
  this.hitPosY = null;
  this.messagePos = 0;
  this.caughtByPlayer = false;
  this.hidden = false;
  switch(color) {
    case GEM_COLOR_ORANGE:
      this.sprite = 'images/Gem Orange.png';
      this.score = GEM_SCORE_ORANGE;
      break;
    case GEM_COLOR_GREEN:
      this.sprite = 'images/Gem Green.png';
      this.score = GEM_SCORE_GREEN;
      break;
    case GEM_COLOR_BLUE:
    default:
      this.sprite =  'images/Gem Blue.png';
      this.score = GEM_SCORE_BLUE;
      break;
  }
};

/**
 * @description
 * - render gem
*/
Gem.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/**
 * @description
 * - Star class that enables player to become super strong!!
*/
var Star = function(x, y) {
  this.x = x;
  this.y = y;
  this.orgY = y; // no adjustment for Star, but to make it the same as other items
  this.isShown = false;
  this.sprite = 'images/Star.png';
};

/**
 * @description
 * - render Star
*/
Star.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * @description
 * - place heart and gems in the game field
 */
function placeItems() {
  placeHeart();
  placeStar();
  placeGems();
}

/**
 * @description
 * - place star item
*/
function placeStar() {
  if(player.superModeCount > 0) {
    return;
  }
  if(player.currentLevel >= STAR_APPEAR_LEVEL) {
    var rnd = Math.random();
    if(rnd <= RATE_STAR_APPEAR) {
      var x = randomItemX();
      var y = randomItemRow();
      if(heart && heart.x === x && heart.orgY === y) {
        return;
      }
      star = new Star(x, y);
      star.isShown = true;
    } else {
      star = null;
    }
  }
}

/**
 * @description
 * - generate gems and place in the game field
*/
function placeGems() {
  gems = [];
  var rnd = parseInt(Math.random() * 10 / 3);

  for (var cnt = 0; cnt < rnd; cnt++) {

    var gemRnd = Math.random();
    var x = randomItemX();
    var y = randomItemRow();

    if((heart && heart.x === x && heart.orgY === y) ||
      (star && star.x === x && star.orgY === y )) {
      // if there is a heart or a star already, no need to place a gem
      return;
    }

    gems.forEach(function(gem) {
      if(gem.x === x && gem.y === y) {
        return; // already another gem on the same location
      }
    });

    var color = GEM_COLOR_BLUE; // default
    if (gemRnd < RATE_ORANGE_GEM_APPEAR) {
      // Highest scored gem
      color = GEM_COLOR_ORANGE;
    } else if (gemRnd < RATE_GREEN_GEM_APPEAR) {
      // Middle scored gem
      color = GEM_COLOR_GREEN;
    }
    var gem = new Gem(x, y, color);
    gems.push(gem);
  }

  if(gems.length) {
    gems.sort(function(a, b) {
      if(a.y < b.y) return -1;
      if(a.y > b.y) return 1;
    });
  }
}

/**
 * @description
 * - place a heart in the game field
*/
function placeHeart() {
  var rnd = Math.random();
  if(rnd < RATE_HEART_APPEAR) {
    heart = new Heart(randomItemX(), randomItemRow());
    heart.isShown = true;
  } else {
    heart = null;
  }
}

/**
 * @description
 * - check if player has got an item
*/
function checkGetItem() {

  if(heart && heart.isShown) {
    if(player.x === heart.x && player.y === heart.orgY) {
      if(!player.gotHeart) {
        withSound && itemSound.play();
      }
      player.gotHeart = true;
      player.lives += 1;
      heart = null;
    }
  }

  if(star && star.isShown) {
    if(player.x === star.x && player.y === star.orgY) {
      if(!player.gotStar) {
        withSound && itemSound.play();
      }
      player.gotStar = true;
      player.superModeCount = SUPER_MODE_COUNT_START;
      if(withSound) {
        mainBGM.pause();
        superModeBGM.play();
      }
      star = null;
    }
  }

  gems.forEach(function(gem, index) {
    if(player.x === gem.x && player.y === gem.orgY) {
      player.score += gem.score;
      gem.hitPosX = player.x;
      gem.hitPosY = player.y;
      if(!gem.caughtByPlayer) {
        withSound && itemSound.play();
      }
      gem.caughtByPlayer = true;
    }
  });
}

/**
 * @description
 * - generate a new player instance
*/
function playerFactory() {
  return new Player(PLAYER_START_X, PLAYER_START_Y);
}

/**
 * @description
 *  Now instantiate your objects.
 *  Place all enemy objects in an array called allEnemies
*/
function newEnemies() {
  for (var i = 0; i < currentEnemyRowCount; i++) {
    allEnemies.push(new Enemy(randomStartX(), randomRow(), randomSpeed()));
  }

  if (allEnemies.length > EXECUTE_DELETE_ENEMIES_COUNT) {
    allEnemies.splice(0, DELETE_ENEMY_COUNT); // to reduce memory use
  }
}

/**
 * @description
 * - get x-position for enemies randomly
*/
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

/**
 * @description
 * - get a row for enemies randomly
*/
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

/**
 * @description
 * - get an item row randomly
*/
function randomItemRow() {
  var rnd = Math.random();
  if (rnd > 0.66) {
    return PLAYER_1ST_ROW;
  } else if (rnd > 0.33) {
    return PLAYER_2ND_ROW;
  } else {
    return PLAYER_3RD_ROW;
  }
}

/**
 * @description
 * - get a x position for an item randomly
*/
function randomItemX() {
  var rnd = Math.random() * 10;
  rnd = parseInt(rnd / 2); // same as the number of blocks
  console.log(rnd);
  return MOVE_WIDTH * rnd;
}

/**
 * @description
 * - get random speed for enemy
*/
function randomSpeed() {
  if (Math.random() > UNLUCKY_LEVEL) {
    return UNLUCKY_SPEED; // LOL...
  } else if (Math.random() > EXTRA_FAST_LEVEL) {
    return EXTRA_FAST;
  } else {
    return (Math.random() + 1) * currentBasicSpeed;
  }
}

/**
 * @description
 * - make the game more difficult after level up
*/
function moreDifficult (level) {
  currentBasicSpeed += BASIC_SPEED_UP;
  clearInterval(enemiesTimer);
  newEnemies();
  currentEnemyAppearInterval -= level * 3; // for adjustment
  enemiesTimer = setInterval(newEnemies, currentEnemyAppearInterval);
}

// generate new instance for player to start
var player = playerFactory();

/**
 * @description
 * - This listens for key presses and sends the keys to your
 * - Player.handleInput() method. You don't need to modify this.
 * @param {string} keyup - keyup event to listen
*/
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: LEFT,
    38: UP,
    39: RIGHT,
    40: DOWN
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * @description
 * - check if player and one of enemies collided with each other
*/
function checkCollisions() {
  allEnemies.forEach(function (enemy) {
    if (enemy.inTarget(player)) {
      dead = true;
      return true;
    }
  });
  return false;
}

/**
 * @description
 * - timer method counting down to timeout for a level
*/
function countDownForLevel() {
  var meter = parseInt(timeLimit * 10 / TIME_LIMIT_TO_CLEAR_A_LEVEL);
  timeLimit -= 1;
  $('.meter-' + meter.toString()).css('opacity', '');

  if (meter < 8 && meter >= 5) {
    $('.meter').css('background-color', 'yellow');
  } else if (meter < 5 && meter > 1) {
    $('.meter').css('background-color', 'red');
  } else if (meter == 1) {
    if(!player.timeOut) {
      withSound && timeoutSound.play();
    }
    player.timeOut = true;
  }
}

/**
 * @description
 * - reset indicator for timeout with animation
*/
function meterReset() {
  clearInterval(levelTimer);
  timeLimit = TIME_LIMIT_TO_CLEAR_A_LEVEL + 1;
  player.timeOut = false;

  $('.meter').css('background-color', 'deepskyblue');
  var showMeterInterval = 50;
  $('.meter-1').animate({opacity: "1"}, showMeterInterval, function () {
    $('.meter-2').animate({opacity: "1"}, showMeterInterval, function () {
      $('.meter-3').animate({opacity: "1"}, showMeterInterval, function () {
        $('.meter-4').animate({opacity: "1"}, showMeterInterval, function () {
          $('.meter-5').animate({opacity: "1"}, showMeterInterval, function () {
            $('.meter-6').animate({opacity: "1"}, showMeterInterval, function () {
              $('.meter-7').animate({opacity: "1"}, showMeterInterval, function () {
                $('.meter-8').animate({opacity: "1"}, showMeterInterval, function () {
                  $('.meter-9').animate({opacity: "1"}, showMeterInterval, function () {
                    $('.meter-10').animate({opacity: "1"}, showMeterInterval);
                  });
                });
              });
            });
          });
        });
      });
    })
  });
  levelTimer = setInterval(countDownForLevel, TIME_OUT_TICKING);
}

/**
 * @description
 * - show current player's level
*/
function showLevelInfo () {
  var counter = 0;
  // show level info with animation
  $.each($('#game-info h1 span'), function () {
    counter += 1;
    $(this).delay(100 * counter).animate({'opacity': 1}, 300);
  });
}

/**
 * @description
 * - reset all variables
*/
function stopTimers () {
  clearInterval(levelTimer);
  clearInterval(enemiesTimer);
}

/**
 * @description
 * - show game over view with final score information
*/
function gameOver () {
  withSound && mainBGM.stop();
  $('#game-info').hide();
  withSound && gameOverBGM.play();
  $('#game-over').fadeIn('slow');

  var store = localStorage.getItem(LOCAL_STORAGE_NAMESPACE);
  var highestScore = 0;
  if(!store) {
    localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify({highest_score: player.score}))
  } else {
    highestScore = JSON.parse(store).highest_score;
    if(player.score > highestScore) {
      localStorage.setItem(LOCAL_STORAGE_NAMESPACE, JSON.stringify({highest_score: player.score}));
    }
  }
  $('#final-score-text').text(player.score);
  $('#highest-score-text').text(highestScore);

  var showInterval = 200;
  $('.game-over-char1').fadeTo(showInterval, 1, function(){
    $('.game-over-char2').fadeTo(showInterval, 1, function(){
      $('.game-over-char3').fadeTo(showInterval, 1, function(){
        $('.game-over-char4').fadeTo(showInterval, 1, function(){
          $('.game-over-char5').fadeTo(showInterval, 1, function(){
            $('.game-over-char6').fadeTo(showInterval, 1, function(){
              $('.game-over-char7').fadeTo(showInterval, 1, function(){
                $('.game-over-char8').fadeTo(showInterval, 1, function(){
                  $('.game-over-char').css({'font-style': 'italic'});
                  $('#angel').animate({top: '30px', opacity: 0.6}, 1000, function() {
                    $('#final-score').animate({opacity: 1}, 1000, function() {
                      $('#highest-score').animate({opacity: 1}, 1000, function() {
                        $('#restart-button').show();
                        if(player.score > highestScore && highestScore > 0) {
                          $('#congratulation').animate({opacity: 1}, 1000, function(){
                            setInterval(flashCongratulation, 1000)
                          });
                        }
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

/**
 * @description
 * - if player gets the highest score, show text with flashing
*/
function flashCongratulation () {
  $('#congratulation').animate({opacity: 0}, 100, function() {
    $('#congratulation').animate({opacity: 1}, 100);
  })
}