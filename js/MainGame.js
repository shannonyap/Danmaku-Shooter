var spacefield;
var player;
var cursors;

var bullets;
var bulletTime = 0;

var laserShots;
var laserTime = 0;

var fireButton;
var changeWeaponButton;
var currentFireType;
var fireType = {
  BULLET: 1,
  LASER: 2,
};

var hasEnteredSpacefield = false;
var missionStartText;
var gameOver;
var playAgain;
var backToMainMenu;

var noShootingEnemies;
var shootingEnemies;
var radialShootingEnemies;
var circleShootingEnemies;
var doubleCircleShootingEnemies;
var spreadShootingEnemies;
var enemyList = [noShootingEnemies, shootingEnemies, radialShootingEnemies, circleShootingEnemies, doubleCircleShootingEnemies, spreadShootingEnemies];

var shootingEnemiesBullets;
var radialEnemiesBullets;
var circleEnemiesBullets;
var doubleCircleShootingEnemiesBullets;
var spreadShootingEnemiesBullets;
var bulletList = [shootingEnemiesBullets, radialEnemiesBullets, circleEnemiesBullets, doubleCircleShootingEnemiesBullets, spreadShootingEnemiesBullets];

var noShootingWaveTimer;
var shootingWaveTimer;
var radialShootingWaveTimer;
var circleShootingWaveTimer;
var doubleCircleShootingWaveTimer;
var spreadShootingWaveTimer;
var timerList = [noShootingWaveTimer, shootingWaveTimer, radialShootingWaveTimer, circleShootingWaveTimer, doubleCircleShootingWaveTimer, spreadShootingWaveTimer]

var backgroundMusic;
var shotSystemOnlineSound;
var laserSystemOnlineSound;

var laserBeamSound;
var circleLaserShot;
var explosion;

var currGame;

var MainGame = function(game) {
  currGame = this;
}

MainGame.prototype = {
  preload: function() {
    this.game.load.image('starfield', 'assets/starfield.jpg');
    this.game.load.image('player', 'assets/spaceship.png');
    this.game.load.image('playAgainButton', 'assets/playAgain.png');
    this.game.load.image('returnToMainMenu', 'assets/returnToMainMenu.png');
    this.game.load.spritesheet('explosion', 'assets/explosion.png');
    this.initBullets();
    this.initEnemies();
    this.initAudio();
  },

  create: function() {
    this.initializeBackgroundMusic();

    explosion = this.game.add.audio('explosionSound');
    explosion.volume -= 0.91;
    spacefield = this.game.add.tileSprite(0,0,window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'starfield');
    this.revivePlayer();
    cursors = this.game.input.keyboard.createCursorKeys();

    this.createPlayerBullets();
    this.createPlayerLaser();

    this.createEnemyGroups();
    this.createEnemyBullets();

    this.createPlayAgainButton();
    this.createBackToMainMenuButton();

    fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    changeWeaponButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
    changeWeaponButton.onDown.add(function(key) {
      if (currentFireType == fireType.BULLET) {
        currentFireType = fireType.LASER;
      } else {
        laserShots.callAll('kill');
        currentFireType = fireType.BULLET;
      }
      var weaponChangeSound = currGame.game.add.audio('weaponChangeSound');
      weaponChangeSound.onStop.add(currGame.systemTypeSound, this);
      weaponChangeSound.volume -= 0.91;
      weaponChangeSound.play();
    });
  },

  update: function() {
    spacefield.tilePosition.y += 5;
    if (hasEnteredSpacefield) {
      this.playerControls();
      if (fireButton.isDown && player.alive && currentFireType == fireType.BULLET) {
        this.fireBullet();
      } else if (fireButton.isDown && player.alive && currentFireType == fireType.LASER) {
        if (!laserBeamSound.isPlaying) {
          laserBeamSound.play();
        }
        this.fireLaser();
      }
      if (fireButton.isUp && player.alive && currentFireType == fireType.LASER) {
        laserShots.callAll('kill');
      }
    }
  },

  initBullets: function() {
    this.game.load.image('bullet', 'assets/bullets/bullet.png');
    this.game.load.image('playerLaserShot', 'assets/bullets/playerLaserShot.png');
    this.game.load.image('shootingEnemyBullet', 'assets/bullets/shootingEnemyBullet.png');
    this.game.load.image('radialShootingEnemyBullet', 'assets/bullets/radialShootingEnemyBullet.png');
    this.game.load.image('circleShootingEnemyBullet', 'assets/bullets/circleShootingEnemyBullet.png');
    this.game.load.image('doubleCircleShootingEnemyBullet', 'assets/bullets/doubleCircleShootingEnemyBullet.png');
    this.game.load.image('spreadShootingEnemyBullet', 'assets/bullets/spreadShootingEnemyBullet.png');
  },

  initEnemies: function() {
    this.game.load.image('noShootingEnemy', 'assets/enemies/noShootingEnemy.png');
    this.game.load.image('shootingEnemy', 'assets/enemies/shootingEnemy.png');
    this.game.load.image('radialShootingEnemy', 'assets/enemies/radialShootingEnemy.png');
    this.game.load.image('circleShootingEnemy', 'assets/enemies/circleShootingEnemy.png');
    this.game.load.image('doubleCircleShootingEnemy', 'assets/enemies/doubleCircleShootingEnemy.png');
    this.game.load.image('spreadShootingEnemy', 'assets/enemies/spreadShootingEnemy.png');
  },

  initAudio: function() {
    this.game.load.audio('explosionSound', 'assets/audio/explosion.mp3');
    this.game.load.audio('laserShotSound', 'assets/audio/laserShotSound.mp3');
    this.game.load.audio('laserBeamSound', 'assets/audio/laserBeamSound.mp3');
    this.game.load.audio('weaponChangeSound', 'assets/audio/weaponChangeSound.mp3');
    this.game.load.audio('shotSystemOnlineSound', 'assets/audio/shotSystemOnlineSound.mp3');
    this.game.load.audio('laserSystemOnlineSound', 'assets/audio/laserSystemOnlineSound.mp3');
    this.game.load.audio('circleLaserShotSound', 'assets/audio/circleLaserShotSound.mp3');
    this.game.load.audio('missionSound', 'assets/audio/missionSound.mp3');
    this.game.load.audio('startSound', 'assets/audio/startSound.mp3');
    this.game.load.audio('gameOverNiceTrySound', 'assets/audio/gameOverNiceTrySound.mp3');
    this.game.load.audio('backgroundMusic', 'assets/audio/backgroundMusic.mp3');
  },

  createPlayerBullets: function() {
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(35, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
  },

  createPlayerLaser: function() {
    laserShots = this.game.add.group();
    laserShots.enableBody = true;
    laserShots.physicsBodyType = Phaser.Physics.ARCADE;
    laserShots.createMultiple(2, 'playerLaserShot');
    laserShots.setAll('anchor.x', 0.5);
    laserShots.setAll('anchor.y', 1);
    laserShots.setAll('outOfBoundsKill', true);
    laserShots.setAll('checkWorldBounds', true);

    laserBeamSound = this.game.add.audio('laserBeamSound');
    laserBeamSound.volume -= 0.95;
  },

  fireBullet: function() {
    if (this.game.time.now > bulletTime) {
      var laserShotSound = this.game.add.audio('laserShotSound');
      laserShotSound.volume -= 0.95;
      laserShotSound.play();
      var bulletCount = 5;
      while (bulletCount > 0) {
        bullet = bullets.getFirstExists(false);
        if (bullet) {
          bullet.reset(player.x + player.width * 0.8 * bulletCount / 5, player.y);
          bullet.body.velocity.y = -1200;
          bulletTime = this.game.time.now + 100;
        }
        bulletCount--;
      }
    }
  },

  fireLaser: function() {
    laserShot = laserShots.getFirstExists(false);
    if (this.game.time.now > laserTime) {
      if (laserShot) {
        laserShots.callAll('kill');
        laserShot.height = this.game.height;
        laserShot.body.height = this.game.height;
        laserShot.reset(player.x + laserShot.width / 2, player.y * 1.05);
        laserShot.body.velocity.y = -1200;
        laserTime = this.game.time.now + 50;
      }
    }
  },

  createEnemyGroups: function() {
    for (var i = 0; i < enemyList.length; i++) {
      enemyList[i] = this.game.add.group();
    }
  },

  createEnemyBullets: function() {
    for (var i = 0; i < enemyList.length; i++) {
      bulletList[i] = this.game.add.group();
    }
  },

  killAllEnemies: function() {
    for (var i = 0; i < enemyList.length; i++) {
      currGame.killAll(enemyList[i]);
      enemyList[i].destroy();
      enemyList[i] = this.game.add.group();
    }
  },

  killAllEnemiesBullets: function() {
    for (var i = 0; i < enemyList.length; i++) {
      currGame.killAll(bulletList[i]);
      bulletList[i].destroy();
      bulletList[i] = this.game.add.group();
    }
  },

  killAll: function(collection) {
    collection.forEach(function(group) {
      group.callAll('kill');
      group.destroy();
    });
  },

  restartGame: function() {
    backgroundMusic.stop();
    gameOver.destroy();
    playAgain.visible = false;
    backToMainMenu.visible = false;
    gameOver.visible = false;
    currGame.killAllEnemies();
    currGame.killAllEnemiesBullets();
    currGame.revivePlayer();
    currGame.initializeBackgroundMusic();
  },

  backToMainMenu: function() {
    backgroundMusic.stop();
    gameOver.destroy();
    playAgain.visible = false;
    backToMainMenu.visible = false;
    gameOver.visible = false;
    currGame.killAllEnemies();
    currGame.killAllEnemiesBullets();
    this.state.start('MainMenu');
  },

  initializeBackgroundMusic: function() {
    backgroundMusic = this.game.add.audio('backgroundMusic');
    backgroundMusic.loop = true;
    backgroundMusic.volume -= 0.8;
    backgroundMusic.play();
  },

  systemTypeSound: function(sound) {
    if (shotSystemOnlineSound != null) {
      shotSystemOnlineSound.destroy();
    }
    if (laserSystemOnlineSound != null) {
      laserSystemOnlineSound.destroy();
    }
    if (currentFireType == fireType.BULLET && laserSystemOnlineSound != null) {
      shotSystemOnlineSound = currGame.add.audio('shotSystemOnlineSound');
      shotSystemOnlineSound.volume -= 0.7;
      shotSystemOnlineSound.play();
    } else {
      laserSystemOnlineSound = currGame.add.audio('laserSystemOnlineSound');
      laserSystemOnlineSound.volume -= 0.7;
      laserSystemOnlineSound.play();
    }
  },

  revivePlayer: function() {
    player = this.game.add.sprite(this.game.world.centerX, this.game.height * 1.1, 'player');
    this.game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.setSize(10,10,35,50);
    player.body.reset(player.x, player.y)
    currentFireType = fireType.BULLET;
    this.createMissionStartText();
    var shipEnteringSpace = this.game.add.tween(player).to({ y: this.game.world.centerY + 250}, 3000);
    shipEnteringSpace.start();
    setTimeout(function() {
      var missionSound = currGame.game.add.audio('missionSound');
      missionSound.volume -= 0.6;
      missionSound.onStop.add(function() {
        setTimeout(function() {
          var startSound = currGame.game.add.audio('startSound');
          startSound.volume -= 0.6;
          startSound.play();
        }, (75));
      }, this);
      missionSound.play();
    }, (1000));
    shipEnteringSpace.onComplete.add(function() {
      missionStartText.destroy();
      hasEnteredSpacefield = true;
      currGame.createEnemyWavesTimers();
    });
  },

  createEnemyWavesTimers: function() {
    noShootingWaveTimer = this.game.time.create(false);
    noShootingWaveTimer.loop(getRandomInt(3000, 7001), createNoShootingEnemyGroup, this);
    noShootingWaveTimer.start();

    shootingWaveTimer = this.game.time.create(false);
    shootingWaveTimer.loop(getRandomInt(4000, 8001), createShootingEnemyGroup, this);
    shootingWaveTimer.start();

    radialShootingWaveTimer = this.game.time.create(false);
    radialShootingWaveTimer.loop(getRandomInt(6000, 10001), createRadialShootingEnemyGroupWave, this);
    radialShootingWaveTimer.start();

    circleShootingWaveTimer = this.game.time.create(false);
    circleShootingWaveTimer.loop(getRandomInt(9000, 11001), createCircleShootingEnemyGroupWave, this);
    circleShootingWaveTimer.start();

    doubleCircleShootingWaveTimer = this.game.time.create(false);
    doubleCircleShootingWaveTimer.loop(getRandomInt(9000, 11001), createDoubleCircleShootingEnemyGroup, this);
    doubleCircleShootingWaveTimer.start();

    spreadShootingWaveTimer = this.game.time.create(false);
    spreadShootingWaveTimer.loop(getRandomInt(3000, 6001), createSpreadShootingEnemyGroup, this);
    spreadShootingWaveTimer.start();
  },

  createGameOverText: function() {
    gameOver = this.game.add.text(this.game.world.centerX, this.game.world.centerY * 0.8, 'GAME OVER!', { font: '84px Arial', fill: '#fff' });
    var animateToTransparent = this.game.add.tween(gameOver).to({alpha: 0}, 300,Phaser.Easing.None, true);
    var animateToOpaque = this.game.add.tween(gameOver).to({alpha: 1}, 300,Phaser.Easing.None, true);
    animateToTransparent.chain(animateToOpaque);
    animateToTransparent.start();
    animateToTransparent.chainedTween.onComplete.add(function (enemy, tween) {
      tween = animateToTransparent;
      tween.start();
    }, this);
    gameOver.anchor.setTo(0.5, 0.5);
  },

  createMissionStartText: function() {
    missionStartText = this.game.add.text(this.game.world.centerX, this.game.world.centerY * 0.8, 'MISSION START', { font: '84px Arial', fill: '#fff' });
    missionStartText.anchor.setTo(0.5, 0.5);
    var animateToTransparent = this.game.add.tween(missionStartText).to({alpha: 0}, 300,Phaser.Easing.None, true);
    var animateToOpaque = this.game.add.tween(missionStartText).to({alpha: 1}, 300,Phaser.Easing.None, true);
    animateToTransparent.chain(animateToOpaque);
    animateToTransparent.start();
    animateToTransparent.chainedTween.onComplete.add(function (enemy, tween) {
      tween = animateToTransparent;
      tween.start();
    }, this);
  },

  createPlayAgainButton: function() {
    playAgain = this.game.add.button(this.game.world.centerX, this.game.world.centerY * 1.2, 'playAgainButton', this.restartGame, this, 2, 1, 0);
    playAgain.anchor.setTo(0.5, 0.5);
    playAgain.visible = false;
  },

  createBackToMainMenuButton: function() {
    backToMainMenu = this.game.add.button(this.game.world.centerX, this.game.world.centerY * 1.6, 'returnToMainMenu', this.backToMainMenu, this, 2, 1, 0);
    backToMainMenu.anchor.setTo(0.5, 0.5);
    backToMainMenu.visible = false;
  },

  playerControls: function() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown && player.world.x > 0) {
      player.body.velocity.x = -550;
    }
    if (cursors.right.isDown && player.world.x < this.game.width - player.width) {
      player.body.velocity.x = 550;
    }
    if (cursors.up.isDown && player.world.y > 0) {
      player.body.velocity.y = -350;
    }
    if (cursors.down.isDown && player.world.y < this.game.height - player.height) {
      player.body.velocity.y = 350;
    }
  },

}

function createNoShootingEnemyGroup() {
  var noShootingEnemiesGroup = this.game.add.group();
  noShootingEnemiesGroup.enableBody = true;
  noShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  var waveHorizontalOrVertical = getRandomInt(0,2);
  for (var i = 0; i < 4; i++) {
    var enemy;
    if (waveHorizontalOrVertical == 1) {
      enemy = noShootingEnemiesGroup.create(10, i * 50, 'noShootingEnemy');
      enemy.body.width = enemy.body.width/2;
      enemy.body.height = enemy.body.height/2;
      noShootingEnemiesGroup.x = getRandomInt(this.game.width * 0.02, this.game.width * 0.95);
    } else {
      enemy = noShootingEnemiesGroup.create(i * 50, 10, 'noShootingEnemy');
      noShootingEnemiesGroup.x = getRandomInt(this.game.width * 0.02, this.game.width * 0.875);
    }
    enemy.health = 50;
    enemy.body.setSize(30, 30, 30, 0);
    enemy.anchor.setTo(0.5, 0.5);
    enemy.body.velocity.y = 150;
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(removeEnemy, this);
    var originalTint = enemy.tint;
    enemy.update = function() {
      enemy.tint = originalTint;
      this.game.physics.arcade.overlap(bullets, noShootingEnemiesGroup, collisionHandler, null, this);
      this.game.physics.arcade.overlap(laserShots, noShootingEnemiesGroup, collisionHandler, null, this);
    }
  }
  noShootingEnemiesGroup.y = -this.game.height * 0.3;
  enemyList[0].add(noShootingEnemiesGroup);
}

function createShootingEnemyGroup() {
  var shootingEnemiesGroup = this.game.add.group();
  shootingEnemiesGroup.enableBody = true;
  shootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 1; i++) {
      var enemy = shootingEnemiesGroup.create(10, 10, 'shootingEnemy');
      enemy.scale.setTo(0.05, 0.05);
      enemy.anchor.setTo(0.5, 0.5);
      enemy.body.setSize(300, 45, 300, 300);
      enemy.body.velocity.y = 50;
      enemy.checkWorldBounds = true;
      enemy.events.onOutOfBounds.add(removeEnemy, this);
      enemy.health = 75;
      //  Set up firing
      var shootingEnemyBulletSpeed = 270;
      var firingDelay = 1000;
      var shootingEnemyBulletTime = 0;
      var shootingEnemyBullets = this.game.add.group();
      shootingEnemyBullets.enableBody = true;
      shootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
      shootingEnemyBullets.createMultiple(10, 'shootingEnemyBullet');
      shootingEnemyBullets.setAll('anchor.x', 0.5);
      shootingEnemyBullets.setAll('anchor.y', 1);
      shootingEnemyBullets.setAll('outOfBoundsKill', true);
      shootingEnemyBullets.setAll('checkWorldBounds', true);

      var originalTint = enemy.tint;
      enemy.update = function() {
        enemy.tint = originalTint;
        this.game.physics.arcade.overlap(shootingEnemyBullets, player, enemyHitsPlayer, null, this);
        this.game.physics.arcade.overlap(bullets, shootingEnemiesGroup, collisionHandler, null, this);
        this.game.physics.arcade.overlap(laserShots, shootingEnemiesGroup, collisionHandler, null, this);
        if (this.game.time.now > shootingEnemyBulletTime && enemy.alive) {
          enemyBullet = shootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(shootingEnemiesGroup.x, this.y - this.game.height * 0.25);
            var angle = this.game.physics.arcade.moveToObject(enemyBullet, player, shootingEnemyBulletSpeed);
            enemyBullet.angle = this.game.math.radToDeg(angle);
            shootingEnemyBulletTime = this.game.time.now + firingDelay;
          }
        }
      }
  }
  shootingEnemiesGroup.x = getRandomInt(0, this.game.width);
  shootingEnemiesGroup.y = -this.game.height * 0.3;
  enemyList[1].add(shootingEnemiesGroup);
  bulletList[0].add(shootingEnemyBullets);
}

function createRadialShootingEnemyGroup() {
  var radialShootingEnemiesGroup = currGame.game.add.group();
  radialShootingEnemiesGroup.enableBody = true;
  radialShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 1; i++) {
    var enemy = radialShootingEnemiesGroup.create(0, 50, 'radialShootingEnemy');
    radialShootingEnemiesGroup.x = getRandomInt(currGame.game.width * 0.02, currGame.game.width * 0.95);
    enemy.anchor.setTo(0.5, 0.5);
    enemy.body.velocity.y = 300;
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(removeEnemy, this);
    enemy.health = 100;
    //  Set up firing
    var radialShootingEnemyBulletSpeed = 200;
    var firingDelay = 50;
    var radialShootingEnemyBulletTime = 0;
    var radialShootingEnemyBullets = currGame.game.add.group();
    radialShootingEnemyBullets.enableBody = true;
    radialShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    radialShootingEnemyBullets.createMultiple(60, 'radialShootingEnemyBullet');
    radialShootingEnemyBullets.setAll('anchor.x', 0.5);
    radialShootingEnemyBullets.setAll('anchor.y', 1);
    radialShootingEnemyBullets.setAll('outOfBoundsKill', true);
    radialShootingEnemyBullets.setAll('checkWorldBounds', true);

    var bulletVelocityX = -180;
    var bulletVelocityY = -180;
    var originalTint = enemy.tint;
    enemy.update = function() {
      enemy.tint = originalTint;
      this.angle += 1;
      this.game.physics.arcade.overlap(radialShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      this.game.physics.arcade.overlap(bullets, radialShootingEnemiesGroup, collisionHandler, null, this);
      this.game.physics.arcade.overlap(laserShots, radialShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= this.game.height / 2 + this.height) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (this.game.time.now > radialShootingEnemyBulletTime && this.alive) {
          enemyBullet = radialShootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(radialShootingEnemiesGroup.x, this.y - this.game.height * 0.28);
            enemyBullet.body.velocity.x = Math.cos(bulletVelocityX) * radialShootingEnemyBulletSpeed;
            enemyBullet.body.velocity.y = Math.sin(bulletVelocityY) * radialShootingEnemyBulletSpeed;
            bulletVelocityX++;
            bulletVelocityY++;
            radialShootingEnemyBulletTime = this.game.time.now + firingDelay;
          }
        }
      }
    }
  }
  radialShootingEnemiesGroup.y = -currGame.game.height * 0.3;
  enemyList[2].add(radialShootingEnemiesGroup);
  enemyList[1].add(radialShootingEnemyBullets);
}

function createRadialShootingEnemyGroupWave() {
  createRadialShootingEnemyGroup();
  createRadialShootingEnemyGroup();
}

function createCircleShootingEnemyGroup(position) {
  var circleShootingEnemiesGroup = currGame.game.add.group();
  circleShootingEnemiesGroup.enableBody = true;
  circleShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 1; i++) {
    var enemy = circleShootingEnemiesGroup.create(0, 50, 'circleShootingEnemy');
    circleShootingEnemiesGroup.x = position;
    enemy.anchor.setTo(0.5, 0.5);
    enemy.body.velocity.y = 300;
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(removeEnemy, this);
    enemy.health = 150;
    //  Set up firing
    var circleShootingEnemyBulletSpeed = 225;
    var firingDelay = 3000;
    var circleShootingEnemyBulletTime = 0;
    var circleShootingEnemyBullets = currGame.game.add.group();
    circleShootingEnemyBullets.enableBody = true;
    circleShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    circleShootingEnemyBullets.createMultiple(15, 'circleShootingEnemyBullet');
    circleShootingEnemyBullets.setAll('anchor.x', 0.5);
    circleShootingEnemyBullets.setAll('anchor.y', 1);
    circleShootingEnemyBullets.setAll('outOfBoundsKill', true);
    circleShootingEnemyBullets.setAll('checkWorldBounds', true);

    var animateRight = currGame.game.add.tween(enemy).to({ x: currGame.game.width * 0.3}, 5000);
    var animateLeft = currGame.game.add.tween(enemy).to({ x: currGame.game.width * -0.3}, 5000);
    animateRight.chain(animateLeft);
    animateRight.start();
    animateRight.chainedTween.onComplete.add(function (enemy, tween) {
      tween = animateRight;
      tween.start();
    }, this);
    var originalTint = enemy.tint;
    enemy.update = function() {
      enemy.tint = originalTint;
      this.game.physics.arcade.overlap(circleShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      this.game.physics.arcade.overlap(bullets, circleShootingEnemiesGroup, collisionHandler, null, this);
      this.game.physics.arcade.overlap(laserShots, circleShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= this.game.height / 2) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (this.game.time.now > circleShootingEnemyBulletTime && this.alive) {
          var amount, start, step, i, angle, speed;
          amount = 10;
          start = Math.PI * -1;
          step = Math.PI / amount * 2;
          j = amount;
          while (j > 0) {
            enemyBullet = circleShootingEnemyBullets.getFirstExists(false);
            if (enemyBullet) {
              enemyBullet.reset(this.game.width * 0.01 + this.x + circleShootingEnemiesGroup.x, this.y - this.game.height * 0.28);
              var angle = start + j * step;
              enemyBullet.body.velocity.x = Math.cos(angle) * circleShootingEnemyBulletSpeed;
              enemyBullet.body.velocity.y = Math.sin(angle) * circleShootingEnemyBulletSpeed;
              circleShootingEnemyBulletTime = this.game.time.now + firingDelay;
            }
            j--;
          }
          var circleLaserShot = this.game.add.audio('circleLaserShotSound');
          circleLaserShot.volume -= 0.94;
          circleLaserShot.play();
        }
      }
    }
  }
  circleShootingEnemiesGroup.y = -currGame.game.height * 0.3;
  enemyList[3].add(circleShootingEnemiesGroup);
  enemyList[2].add(circleShootingEnemyBullets);
}

function createCircleShootingEnemyGroupWave() {
  createCircleShootingEnemyGroup(this.game.width * 0.3);
  createCircleShootingEnemyGroup(this.game.width * 0.6);
}

function createDoubleCircleShootingEnemyGroup() {
  var doubleCircleShootingEnemiesGroup = this.game.add.group();
  doubleCircleShootingEnemiesGroup.enableBody = true;
  doubleCircleShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  doubleCircleShootingEnemiesGroup.x = getRandomInt(0, this.game.width);
  for (var i = 0; i < 1; i++) {
    var enemy = doubleCircleShootingEnemiesGroup.create(0, 50, 'doubleCircleShootingEnemy');
    enemy.anchor.setTo(0.5, 0.5);
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(removeEnemy, this);
    enemy.health = 200;
    //  Set up firing
    var doubleCircleShootingEnemyBulletSpeed = 210;
    var firingDelay = 2500;
    var doubleCircleShootingEnemyBulletTime = 0;
    var doubleCircleShootingEnemyBullets = this.game.add.group();
    doubleCircleShootingEnemyBullets.enableBody = true;
    doubleCircleShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    doubleCircleShootingEnemyBullets.createMultiple(80, 'doubleCircleShootingEnemyBullet');
    doubleCircleShootingEnemyBullets.setAll('anchor.x', 0.5);
    doubleCircleShootingEnemyBullets.setAll('anchor.y', 1);
    doubleCircleShootingEnemyBullets.setAll('outOfBoundsKill', true);
    doubleCircleShootingEnemyBullets.setAll('checkWorldBounds', true);

    var animateBottomLeft = this.game.add.tween(doubleCircleShootingEnemiesGroup).to({ x: this.game.width * 0.2, y: this.game.height * 0.8}, 3500);
    var animateTopLeft = this.game.add.tween(doubleCircleShootingEnemiesGroup).to({ y: this.game.height * 0.2}, 3500);
    var animateTopRight = this.game.add.tween(doubleCircleShootingEnemiesGroup).to({ x: this.game.width * 0.8}, 3500);
    var animateBottomRight = this.game.add.tween(doubleCircleShootingEnemiesGroup).to({ y: this.game.height * 0.8}, 3500);
    animateBottomLeft.start();
    animateBottomLeft.onComplete.add(function(enemy, tween) {
      tween = animateTopLeft;
      tween.start();
    }, this);
    animateTopLeft.onComplete.add(function(enemy, tween) {
      tween = animateTopRight;
      tween.start();
    }, this);
    animateTopRight.onComplete.add(function(enemy, tween) {
      tween = animateBottomRight;
      tween.start();
    }, this);
    animateBottomRight.onComplete.add(function(enemy, tween) {
      tween = animateBottomLeft;
      tween.start();
    }, this);

    var originalTint = enemy.tint;
    enemy.update = function() {
      this.angle++;
      enemy.tint = originalTint;
      this.game.physics.arcade.overlap(doubleCircleShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      this.game.physics.arcade.overlap(bullets, doubleCircleShootingEnemiesGroup, collisionHandler, null, this);
      this.game.physics.arcade.overlap(laserShots, doubleCircleShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= this.game.height / 2) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (this.game.time.now > doubleCircleShootingEnemyBulletTime && this.alive) {
          for (var number = 1; number >= 0.2; number-= 0.4) {
          var amount, start, step, i, angle, speed;
          amount = 15;
          start = Math.PI * -1;
          step = Math.PI / amount * 2;
          j = amount;
          while (j > 0) {
            enemyBullet = doubleCircleShootingEnemyBullets.getFirstExists(false);
            if (enemyBullet) {
              enemyBullet.reset(doubleCircleShootingEnemiesGroup.x + 10, doubleCircleShootingEnemiesGroup.y + this.height);
              var angle = start + j * step;
              enemyBullet.body.velocity.x = Math.cos(angle) * doubleCircleShootingEnemyBulletSpeed * number;
              enemyBullet.body.velocity.y = Math.sin(angle) * doubleCircleShootingEnemyBulletSpeed * number;
              doubleCircleShootingEnemyBulletTime = this.game.time.now + firingDelay;
            }
            j--;
          }
          }
        }
      }
    }
  }
  doubleCircleShootingEnemiesGroup.y = -this.game.height * 0.3;
  enemyList[4].add(doubleCircleShootingEnemiesGroup);
  enemyList[3].add(doubleCircleShootingEnemyBullets);
}

function createSpreadShootingEnemyGroup() {
  var spreadShootingEnemiesGroup = this.game.add.group();
  spreadShootingEnemiesGroup.enableBody = true;
  spreadShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  spreadShootingEnemiesGroup.x = getRandomInt(0, this.game.width);

  for (var i = 0; i < 1; i++) {
      var enemy = spreadShootingEnemiesGroup.create(10, 10, 'spreadShootingEnemy');
      enemy.anchor.setTo(0.5, 0.5);
      enemy.checkWorldBounds = true;
      enemy.events.onOutOfBounds.add(removeEnemy, this);
      enemy.health = 200;
      //  Set up firing
      var spreadShootingEnemyBulletSpeed = 200;
      var firingDelay = 2000;
      var spreadShootingEnemyBulletTime = 0;
      var spreadShootingEnemyBullets = this.game.add.group();
      spreadShootingEnemyBullets.enableBody = true;
      spreadShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
      spreadShootingEnemyBullets.createMultiple(30, 'spreadShootingEnemyBullet');
      spreadShootingEnemyBullets.setAll('anchor.x', 0.5);
      spreadShootingEnemyBullets.setAll('anchor.y', 1);
      spreadShootingEnemyBullets.setAll('outOfBoundsKill', true);
      spreadShootingEnemyBullets.setAll('checkWorldBounds', true);

      var animateCenter = this.game.add.tween(spreadShootingEnemiesGroup).to({ x: this.game.world.centerX, y: this.game.world.centerY}, 2500);
      var animateLeft = this.game.add.tween(spreadShootingEnemiesGroup).to({ x: this.game.world.centerX - (this.game.width * 0.4)}, 2500);
      var animateTop = this.game.add.tween(spreadShootingEnemiesGroup).to({ x: this.game.world.centerX, y: this.game.height * 0.4, y: this.game.world.centerY + this.game.height * -0.4}, 2500);
      var animateRight = this.game.add.tween(spreadShootingEnemiesGroup).to({ x: this.game.world.centerX + (this.game.width * 0.4), y: this.game.world.centerY}, 2500);
      animateCenter.start();
      animateCenter.onComplete.add(function(enemy, tween) {
        tween = animateLeft;
        tween.start();
      }, this);
      animateLeft.onComplete.add(function(enemy, tween) {
        tween = animateTop;
        tween.start();
      }, this);
      animateTop.onComplete.add(function(enemy, tween) {
        tween = animateRight;
        tween.start();
      }, this);
      animateRight.onComplete.add(function(enemy, tween) {
        tween = animateCenter;
        tween.start();
      }, this);
      var originalTint = enemy.tint;
      enemy.update = function() {
        this.tint = originalTint;
        this.game.physics.arcade.overlap(spreadShootingEnemyBullets, player, enemyHitsPlayer, null, this);
        this.game.physics.arcade.overlap(bullets, spreadShootingEnemiesGroup, collisionHandler, null, this);
        this.game.physics.arcade.overlap(laserShots, spreadShootingEnemiesGroup, collisionHandler, null, this);
        if (this.game.time.now > spreadShootingEnemyBulletTime && enemy.alive) {
          var amountOfBullets = 8;
          start = (7 * Math.PI / 4) * -1;
          step = (Math.PI / 4) / amountOfBullets * 2;
          while (amountOfBullets > 0) {
            enemyBullet = spreadShootingEnemyBullets.getFirstExists(false);
            if (enemyBullet) {
              enemyBullet.reset(spreadShootingEnemiesGroup.x + this.x, spreadShootingEnemiesGroup.y + this.height * 0.5);
              var angle = start + amountOfBullets * step;
              enemyBullet.body.velocity.x = Math.cos(angle) * spreadShootingEnemyBulletSpeed;
              enemyBullet.body.velocity.y = Math.sin(angle) * spreadShootingEnemyBulletSpeed;
              spreadShootingEnemyBulletTime = this.game.time.now + firingDelay;
            }
            amountOfBullets--;
          }
        }
      }
  }
  spreadShootingEnemiesGroup.y = -this.game.height * 0.3;
  enemyList[5].add(spreadShootingEnemiesGroup);
  bulletList[4].add(spreadShootingEnemyBullets);
}

function enemyHitsPlayer(bullet, player) {
  bullet.kill();
  player.loadTexture('explosion', 0);
  explosion.play();
  setTimeout(function() {
    player.kill();
  }, (50));
  noShootingWaveTimer.destroy();
  shootingWaveTimer.destroy();
  radialShootingWaveTimer.destroy();
  circleShootingWaveTimer.destroy();
  doubleCircleShootingWaveTimer.destroy();
  spreadShootingWaveTimer.destroy();
  currGame.createGameOverText();
  playAgain.visible = true;
  backToMainMenu.visible = true;
  hasEnteredSpacefield = false;
  var gameOverNiceTrySound = this.game.add.audio('gameOverNiceTrySound');
  gameOverNiceTrySound.volume -= 0.85;
  gameOverNiceTrySound.play();
  backgroundMusic.fadeOut(3000);
}

function collisionHandler(bullet, enemy) {
  if (enemy.health > 0) {
    if (bullet.key == "playerLaserShot") {
      enemy.health -= 15;
      bullet.height = (player.y - enemy.y) * 2.75;
    } else {
      enemy.health -= 30;
      bullet.kill();
    }
    enemy.tint = 0xff3655;
  } else if (enemy.health <= 0) {
    enemy.loadTexture('explosion', 0);
    explosion.play();
    setTimeout(function() {
      enemy.kill();
    }, (50));
  }
}

function removeEnemy(enemy) {
  if (enemy.y > currGame.game.height) {
    enemy.kill();
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
