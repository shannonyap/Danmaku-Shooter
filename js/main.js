var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update});

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

function preload() {
  game.load.image('starfield', 'assets/starfield.jpg');
  game.load.image('player', 'assets/spaceship.png');
  game.load.image('playAgainButton', 'assets/playAgain.png');
  game.load.spritesheet('explosion', 'assets/explosion.png');
  initBullets();
  initEnemies();
  initAudio();
}

function create() {
  initializeBackgroundMusic();

  explosion = game.add.audio('explosionSound');
  explosion.volume -= 0.91;
  spacefield = game.add.tileSprite(0,0,window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'starfield');
  revivePlayer();
  cursors = game.input.keyboard.createCursorKeys();

  createPlayerBullets();
  createPlayerLaser();

  createEnemyGroups();
  createEnemyBullets();

  createPlayAgainButton();

  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  changeWeaponButton = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  changeWeaponButton.onDown.add(function(key) {
    if (currentFireType == fireType.BULLET) {
      currentFireType = fireType.LASER;
    } else {
      laserShots.callAll('kill');
      currentFireType = fireType.BULLET;
    }
    var weaponChangeSound = game.add.audio('weaponChangeSound');
    weaponChangeSound.onStop.add(systemTypeSound, this);
    weaponChangeSound.volume -= 0.91;
    weaponChangeSound.play();
  });
}

function update() {
  spacefield.tilePosition.y += 5;
  if (hasEnteredSpacefield) {
    playerControls();
    if (fireButton.isDown && player.alive && currentFireType == fireType.BULLET) {
      fireBullet();
    } else if (fireButton.isDown && player.alive && currentFireType == fireType.LASER) {
      if (!laserBeamSound.isPlaying) {
        laserBeamSound.play();
      }
      fireLaser();
    }
    if (fireButton.isUp && player.alive && currentFireType == fireType.LASER) {
      laserShots.callAll('kill');
    }
  }
}

function initBullets() {
  game.load.image('bullet', 'assets/bullets/bullet.png');
  game.load.image('playerLaserShot', 'assets/bullets/playerLaserShot.png');
  game.load.image('shootingEnemyBullet', 'assets/bullets/shootingEnemyBullet.png');
  game.load.image('radialShootingEnemyBullet', 'assets/bullets/radialShootingEnemyBullet.png');
  game.load.image('circleShootingEnemyBullet', 'assets/bullets/circleShootingEnemyBullet.png');
  game.load.image('doubleCircleShootingEnemyBullet', 'assets/bullets/doubleCircleShootingEnemyBullet.png');
  game.load.image('spreadShootingEnemyBullet', 'assets/bullets/spreadShootingEnemyBullet.png');
}

function initEnemies() {
  game.load.image('noShootingEnemy', 'assets/enemies/noShootingEnemy.png');
  game.load.image('shootingEnemy', 'assets/enemies/shootingEnemy.png');
  game.load.image('radialShootingEnemy', 'assets/enemies/radialShootingEnemy.png');
  game.load.image('circleShootingEnemy', 'assets/enemies/circleShootingEnemy.png');
  game.load.image('doubleCircleShootingEnemy', 'assets/enemies/doubleCircleShootingEnemy.png');
  game.load.image('spreadShootingEnemy', 'assets/enemies/spreadShootingEnemy.png');
}

function initAudio() {
  game.load.audio('explosionSound', 'assets/audio/explosion.mp3');
  game.load.audio('laserShotSound', 'assets/audio/laserShotSound.mp3');
  game.load.audio('laserBeamSound', 'assets/audio/laserBeamSound.mp3');
  game.load.audio('weaponChangeSound', 'assets/audio/weaponChangeSound.mp3');
  game.load.audio('shotSystemOnlineSound', 'assets/audio/shotSystemOnlineSound.mp3');
  game.load.audio('laserSystemOnlineSound', 'assets/audio/laserSystemOnlineSound.mp3');
  game.load.audio('circleLaserShotSound', 'assets/audio/circleLaserShotSound.mp3');
  game.load.audio('missionSound', 'assets/audio/missionSound.mp3');
  game.load.audio('startSound', 'assets/audio/startSound.mp3');
  game.load.audio('gameOverNiceTrySound', 'assets/audio/gameOverNiceTrySound.mp3');
  game.load.audio('backgroundMusic', 'assets/audio/backgroundMusic.mp3');
}

function createPlayerBullets() {
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(35, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);
}

function createPlayerLaser() {
  laserShots = game.add.group();
  laserShots.enableBody = true;
  laserShots.physicsBodyType = Phaser.Physics.ARCADE;
  laserShots.createMultiple(2, 'playerLaserShot');
  laserShots.setAll('anchor.x', 0.5);
  laserShots.setAll('anchor.y', 1);
  laserShots.setAll('outOfBoundsKill', true);
  laserShots.setAll('checkWorldBounds', true);

  laserBeamSound = game.add.audio('laserBeamSound');
  laserBeamSound.volume -= 0.95;
}

function fireBullet() {
  if (game.time.now > bulletTime) {
    var laserShotSound = game.add.audio('laserShotSound');
    laserShotSound.volume -= 0.95;
    laserShotSound.play();
    var bulletCount = 5;
    while (bulletCount > 0) {
      bullet = bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(player.x + player.width * 0.8 * bulletCount / 5, player.y);
        bullet.body.velocity.y = -1200;
        bulletTime = game.time.now + 100;
      }
      bulletCount--;
    }
  }
}

function fireLaser() {
  laserShot = laserShots.getFirstExists(false);
  if (game.time.now > laserTime) {
    if (laserShot) {
      laserShots.callAll('kill');
      laserShot.height = game.height;
      laserShot.body.height = game.height;
      laserShot.reset(player.x + laserShot.width / 2, player.y * 1.05);
      laserShot.body.velocity.y = -1200;
      laserTime = game.time.now + 50;
    }
  }
}

function createEnemyGroups() {
  for (var i = 0; i < enemyList.length; i++) {
    enemyList[i] = game.add.group();
  }
}

function createEnemyBullets() {
  for (var i = 0; i < enemyList.length; i++) {
    bulletList[i] = game.add.group();
  }
}

function killAllEnemies() {
  for (var i = 0; i < enemyList.length; i++) {
    killAll(enemyList[i]);
    enemyList[i].destroy();
    enemyList[i] = game.add.group();
  }
}

function killAllEnemiesBullets() {
  for (var i = 0; i < enemyList.length; i++) {
    killAll(bulletList[i]);
    bulletList[i].destroy();
    bulletList[i] = game.add.group();
  }
}

function killAll(collection) {
  collection.forEach(function(group) {
    group.callAll('kill');
    group.destroy();
  });
}

function restartGame() {
  backgroundMusic.stop();
  gameOver.destroy();
  playAgain.visible = false;
  killAllEnemies();
  killAllEnemiesBullets();
  revivePlayer();
  initializeBackgroundMusic();
}

function initializeBackgroundMusic() {
  backgroundMusic = game.add.audio('backgroundMusic');
  backgroundMusic.loop = true;
  backgroundMusic.volume -= 0.8;
  backgroundMusic.play();
}

function systemTypeSound(sound) {
  if (shotSystemOnlineSound != null) {
    shotSystemOnlineSound.destroy();
  }
  if (laserSystemOnlineSound != null) {
    laserSystemOnlineSound.destroy();
  }
  if (currentFireType == fireType.BULLET && laserSystemOnlineSound != null) {
    shotSystemOnlineSound = game.add.audio('shotSystemOnlineSound');
    shotSystemOnlineSound.volume -= 0.7;
    shotSystemOnlineSound.play();
  } else {
    laserSystemOnlineSound = game.add.audio('laserSystemOnlineSound');
    laserSystemOnlineSound.volume -= 0.7;
    laserSystemOnlineSound.play();
  }
}

function revivePlayer() {
  player = game.add.sprite(game.world.centerX, game.height * 1.1, 'player');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.setSize(10,10,35,50);
  player.body.reset(player.x, player.y)
  currentFireType = fireType.BULLET;
  createMissionStartText();
  var shipEnteringSpace = game.add.tween(player).to({ y: game.world.centerY + 250}, 3000);
  shipEnteringSpace.start();
  setTimeout(function() {
    var missionSound = game.add.audio('missionSound');
    missionSound.volume -= 0.6;
    missionSound.onStop.add(function() {
      setTimeout(function() {
        var startSound = game.add.audio('startSound');
        startSound.volume -= 0.6;
        startSound.play();
      }, (75));
    }, this);
    missionSound.play();
  }, (1000));
  shipEnteringSpace.onComplete.add(function() {
    missionStartText.destroy();
    hasEnteredSpacefield = true;
    createEnemyWavesTimers();
  });
}

function createEnemyWavesTimers() {
  noShootingWaveTimer = game.time.create(false);
  noShootingWaveTimer.loop(getRandomInt(3000, 7001), createNoShootingEnemyGroup, this);
  noShootingWaveTimer.start();

  shootingWaveTimer = game.time.create(false);
  shootingWaveTimer.loop(getRandomInt(4000, 8001), createShootingEnemyGroup, this);
  shootingWaveTimer.start();

  radialShootingWaveTimer = game.time.create(false);
  radialShootingWaveTimer.loop(getRandomInt(6000, 10001), createRadialShootingEnemyGroupWave, this);
  radialShootingWaveTimer.start();

  circleShootingWaveTimer = game.time.create(false);
  circleShootingWaveTimer.loop(getRandomInt(9000, 11001), createCircleShootingEnemyGroupWave, this);
  circleShootingWaveTimer.start();

  doubleCircleShootingWaveTimer = game.time.create(false);
  doubleCircleShootingWaveTimer.loop(getRandomInt(9000, 11001), createDoubleCircleShootingEnemyGroup, this);
  doubleCircleShootingWaveTimer.start();

  spreadShootingWaveTimer = game.time.create(false);
  spreadShootingWaveTimer.loop(getRandomInt(3000, 6001), createSpreadShootingEnemyGroup, this);
  spreadShootingWaveTimer.start();
}

function createGameOverText() {
  gameOver = game.add.text(game.world.centerX, game.world.centerY * 0.8, 'GAME OVER!', { font: '84px Arial', fill: '#fff' });
  var animateToTransparent = game.add.tween(gameOver).to({alpha: 0}, 300,Phaser.Easing.None, true);
  var animateToOpaque = game.add.tween(gameOver).to({alpha: 1}, 300,Phaser.Easing.None, true);
  animateToTransparent.chain(animateToOpaque);
  animateToTransparent.start();
  animateToTransparent.chainedTween.onComplete.add(function (enemy, tween) {
    tween = animateToTransparent;
    tween.start();
  }, this);
  gameOver.anchor.setTo(0.5, 0.5);
}

function createMissionStartText() {
  missionStartText = game.add.text(game.world.centerX, game.world.centerY * 0.8, 'MISSION START', { font: '84px Arial', fill: '#fff' });
  missionStartText.anchor.setTo(0.5, 0.5);
  var animateToTransparent = game.add.tween(missionStartText).to({alpha: 0}, 300,Phaser.Easing.None, true);
  var animateToOpaque = game.add.tween(missionStartText).to({alpha: 1}, 300,Phaser.Easing.None, true);
  animateToTransparent.chain(animateToOpaque);
  animateToTransparent.start();
  animateToTransparent.chainedTween.onComplete.add(function (enemy, tween) {
    tween = animateToTransparent;
    tween.start();
  }, this);
}

function createPlayAgainButton() {
  playAgain = game.add.button(game.world.centerX, game.world.centerY * 1.2, 'playAgainButton', restartGame, this, 2, 1, 0);
  playAgain.anchor.setTo(0.5, 0.5);
  playAgain.visible = false;
}

function playerControls() {
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;

  if (cursors.left.isDown && player.world.x > 0) {
    player.body.velocity.x = -550;
  }
  if (cursors.right.isDown && player.world.x < game.width - player.width) {
    player.body.velocity.x = 550;
  }
  if (cursors.up.isDown && player.world.y > 0) {
    player.body.velocity.y = -350;
  }
  if (cursors.down.isDown && player.world.y < game.height - player.height) {
    player.body.velocity.y = 350;
  }
}

function createNoShootingEnemyGroup() {
  var noShootingEnemiesGroup = game.add.group();
  noShootingEnemiesGroup.enableBody = true;
  noShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  var waveHorizontalOrVertical = getRandomInt(0,2);
  for (var i = 0; i < 4; i++) {
    var enemy;
    if (waveHorizontalOrVertical == 1) {
      enemy = noShootingEnemiesGroup.create(10, i * 50, 'noShootingEnemy');
      enemy.body.width = enemy.body.width/2;
      enemy.body.height = enemy.body.height/2;
      noShootingEnemiesGroup.x = getRandomInt(game.width * 0.02, game.width * 0.95);
    } else {
      enemy = noShootingEnemiesGroup.create(i * 50, 10, 'noShootingEnemy');
      noShootingEnemiesGroup.x = getRandomInt(game.width * 0.02, game.width * 0.875);
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
      game.physics.arcade.overlap(bullets, noShootingEnemiesGroup, collisionHandler, null, this);
      game.physics.arcade.overlap(laserShots, noShootingEnemiesGroup, collisionHandler, null, this);
    }
  }
  noShootingEnemiesGroup.y = -game.height * 0.3;
  enemyList[0].add(noShootingEnemiesGroup);
}

function createShootingEnemyGroup() {
  var shootingEnemiesGroup = game.add.group();
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
      var shootingEnemyBullets = game.add.group();
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
        game.physics.arcade.overlap(shootingEnemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(bullets, shootingEnemiesGroup, collisionHandler, null, this);
        game.physics.arcade.overlap(laserShots, shootingEnemiesGroup, collisionHandler, null, this);
        if (game.time.now > shootingEnemyBulletTime && enemy.alive) {
          enemyBullet = shootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(shootingEnemiesGroup.x, this.y - game.height * 0.25);
            var angle = game.physics.arcade.moveToObject(enemyBullet, player, shootingEnemyBulletSpeed);
            enemyBullet.angle = game.math.radToDeg(angle);
            shootingEnemyBulletTime = game.time.now + firingDelay;
          }
        }
      }
  }
  shootingEnemiesGroup.x = getRandomInt(0, game.width);
  shootingEnemiesGroup.y = -game.height * 0.3;
  enemyList[1].add(shootingEnemiesGroup);
  bulletList[0].add(shootingEnemyBullets);
}

function createRadialShootingEnemyGroup() {
  var radialShootingEnemiesGroup = game.add.group();
  radialShootingEnemiesGroup.enableBody = true;
  radialShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 1; i++) {
    var enemy = radialShootingEnemiesGroup.create(0, 50, 'radialShootingEnemy');
    radialShootingEnemiesGroup.x = getRandomInt(game.width * 0.02, game.width * 0.95);
    enemy.anchor.setTo(0.5, 0.5);
    enemy.body.velocity.y = 300;
    enemy.checkWorldBounds = true;
    enemy.events.onOutOfBounds.add(removeEnemy, this);
    enemy.health = 100;
    //  Set up firing
    var radialShootingEnemyBulletSpeed = 200;
    var firingDelay = 50;
    var radialShootingEnemyBulletTime = 0;
    var radialShootingEnemyBullets = game.add.group();
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
      game.physics.arcade.overlap(radialShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(bullets, radialShootingEnemiesGroup, collisionHandler, null, this);
      game.physics.arcade.overlap(laserShots, radialShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= game.height / 2 + this.height) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (game.time.now > radialShootingEnemyBulletTime && this.alive) {
          enemyBullet = radialShootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(radialShootingEnemiesGroup.x, this.y - game.height * 0.28);
            enemyBullet.body.velocity.x = Math.cos(bulletVelocityX) * radialShootingEnemyBulletSpeed;
            enemyBullet.body.velocity.y = Math.sin(bulletVelocityY) * radialShootingEnemyBulletSpeed;
            bulletVelocityX++;
            bulletVelocityY++;
            radialShootingEnemyBulletTime = game.time.now + firingDelay;
          }
        }
      }
    }
  }
  radialShootingEnemiesGroup.y = -game.height * 0.3;
  enemyList[2].add(radialShootingEnemiesGroup);
  enemyList[1].add(radialShootingEnemyBullets);
}

function createRadialShootingEnemyGroupWave() {
  createRadialShootingEnemyGroup();
  createRadialShootingEnemyGroup();
}

function createCircleShootingEnemyGroup(position) {
  var circleShootingEnemiesGroup = game.add.group();
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
    var circleShootingEnemyBullets = game.add.group();
    circleShootingEnemyBullets.enableBody = true;
    circleShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    circleShootingEnemyBullets.createMultiple(15, 'circleShootingEnemyBullet');
    circleShootingEnemyBullets.setAll('anchor.x', 0.5);
    circleShootingEnemyBullets.setAll('anchor.y', 1);
    circleShootingEnemyBullets.setAll('outOfBoundsKill', true);
    circleShootingEnemyBullets.setAll('checkWorldBounds', true);

    var animateRight = game.add.tween(enemy).to({ x: game.width * 0.3}, 5000);
    var animateLeft = game.add.tween(enemy).to({ x: game.width * -0.3}, 5000);
    animateRight.chain(animateLeft);
    animateRight.start();
    animateRight.chainedTween.onComplete.add(function (enemy, tween) {
      tween = animateRight;
      tween.start();
    }, this);
    var originalTint = enemy.tint;
    enemy.update = function() {
      enemy.tint = originalTint;
      game.physics.arcade.overlap(circleShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(bullets, circleShootingEnemiesGroup, collisionHandler, null, this);
      game.physics.arcade.overlap(laserShots, circleShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= game.height / 2) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (game.time.now > circleShootingEnemyBulletTime && this.alive) {
          var amount, start, step, i, angle, speed;
          amount = 10;
          start = Math.PI * -1;
          step = Math.PI / amount * 2;
          j = amount;
          while (j > 0) {
            enemyBullet = circleShootingEnemyBullets.getFirstExists(false);
            if (enemyBullet) {
              enemyBullet.reset(game.width * 0.01 + this.x + circleShootingEnemiesGroup.x, this.y - game.height * 0.28);
              var angle = start + j * step;
              enemyBullet.body.velocity.x = Math.cos(angle) * circleShootingEnemyBulletSpeed;
              enemyBullet.body.velocity.y = Math.sin(angle) * circleShootingEnemyBulletSpeed;
              circleShootingEnemyBulletTime = game.time.now + firingDelay;
            }
            j--;
          }
          var circleLaserShot = game.add.audio('circleLaserShotSound');
          circleLaserShot.volume -= 0.94;
          circleLaserShot.play();
        }
      }
    }
  }
  circleShootingEnemiesGroup.y = -game.height * 0.3;
  enemyList[3].add(circleShootingEnemiesGroup);
  enemyList[2].add(circleShootingEnemyBullets);
}

function createCircleShootingEnemyGroupWave() {
  createCircleShootingEnemyGroup(game.width * 0.3);
  createCircleShootingEnemyGroup(game.width * 0.6);
}

function createDoubleCircleShootingEnemyGroup() {
  var doubleCircleShootingEnemiesGroup = game.add.group();
  doubleCircleShootingEnemiesGroup.enableBody = true;
  doubleCircleShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  doubleCircleShootingEnemiesGroup.x = getRandomInt(0, game.width);
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
    var doubleCircleShootingEnemyBullets = game.add.group();
    doubleCircleShootingEnemyBullets.enableBody = true;
    doubleCircleShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    doubleCircleShootingEnemyBullets.createMultiple(80, 'doubleCircleShootingEnemyBullet');
    doubleCircleShootingEnemyBullets.setAll('anchor.x', 0.5);
    doubleCircleShootingEnemyBullets.setAll('anchor.y', 1);
    doubleCircleShootingEnemyBullets.setAll('outOfBoundsKill', true);
    doubleCircleShootingEnemyBullets.setAll('checkWorldBounds', true);

    var animateBottomLeft = game.add.tween(doubleCircleShootingEnemiesGroup).to({ x: game.width * 0.2, y: game.height * 0.8}, 3500);
    var animateTopLeft = game.add.tween(doubleCircleShootingEnemiesGroup).to({ y: game.height * 0.2}, 3500);
    var animateTopRight = game.add.tween(doubleCircleShootingEnemiesGroup).to({ x:game.width * 0.8}, 3500);
    var animateBottomRight = game.add.tween(doubleCircleShootingEnemiesGroup).to({ y: game.height * 0.8}, 3500);
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
      game.physics.arcade.overlap(doubleCircleShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(bullets, doubleCircleShootingEnemiesGroup, collisionHandler, null, this);
      game.physics.arcade.overlap(laserShots, doubleCircleShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= game.height / 2) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (game.time.now > doubleCircleShootingEnemyBulletTime && this.alive) {
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
              doubleCircleShootingEnemyBulletTime = game.time.now + firingDelay;
            }
            j--;
          }
          }
        }
      }
    }
  }
  doubleCircleShootingEnemiesGroup.y = -game.height * 0.3;
  enemyList[4].add(doubleCircleShootingEnemiesGroup);
  enemyList[3].add(doubleCircleShootingEnemyBullets);
}

function createSpreadShootingEnemyGroup() {
  var spreadShootingEnemiesGroup = game.add.group();
  spreadShootingEnemiesGroup.enableBody = true;
  spreadShootingEnemiesGroup.physicsBodyType = Phaser.Physics.ARCADE;
  spreadShootingEnemiesGroup.x = getRandomInt(0, game.width);

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
      var spreadShootingEnemyBullets = game.add.group();
      spreadShootingEnemyBullets.enableBody = true;
      spreadShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
      spreadShootingEnemyBullets.createMultiple(30, 'spreadShootingEnemyBullet');
      spreadShootingEnemyBullets.setAll('anchor.x', 0.5);
      spreadShootingEnemyBullets.setAll('anchor.y', 1);
      spreadShootingEnemyBullets.setAll('outOfBoundsKill', true);
      spreadShootingEnemyBullets.setAll('checkWorldBounds', true);

      var animateCenter = game.add.tween(spreadShootingEnemiesGroup).to({ x: game.world.centerX, y: game.world.centerY}, 2500);
      var animateLeft = game.add.tween(spreadShootingEnemiesGroup).to({ x: game.world.centerX - (game.width * 0.4)}, 2500);
      var animateTop = game.add.tween(spreadShootingEnemiesGroup).to({ x: game.world.centerX, y: game.height * 0.4, y: game.world.centerY + game.height * -0.4}, 2500);
      var animateRight = game.add.tween(spreadShootingEnemiesGroup).to({ x: game.world.centerX + (game.width * 0.4), y: game.world.centerY}, 2500);
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
        game.physics.arcade.overlap(spreadShootingEnemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(bullets, spreadShootingEnemiesGroup, collisionHandler, null, this);
        game.physics.arcade.overlap(laserShots, spreadShootingEnemiesGroup, collisionHandler, null, this);
        if (game.time.now > spreadShootingEnemyBulletTime && enemy.alive) {
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
              spreadShootingEnemyBulletTime = game.time.now + firingDelay;
            }
            amountOfBullets--;
          }
        }
      }
  }
  spreadShootingEnemiesGroup.y = -game.height * 0.3;
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
  createGameOverText();
  playAgain.visible = true;
  hasEnteredSpacefield = false;
  var gameOverNiceTrySound = game.add.audio('gameOverNiceTrySound');
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
  if (enemy.y > game.height) {
    enemy.kill();
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
