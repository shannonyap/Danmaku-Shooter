var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update});

var spacefield;
var player;
var cursors;

var bullets;
var bulletTime = 0;
var fireButton;

var gameOver;
var playAgain;

var noShootingEnemies;
var shootingEnemies;
var shootingEnemiesBullets;
var radialShootingEnemies;
var radialEnemiesBullets;
var circleShootingEnemies;
var circleEnemiesBullets;

var noShootingWaveTimer;
var shootingWaveTimer;
var radialShootingWaveTimer;
var circleShootingWaveTimer;

var laserShotSound;
var circleLaserShot;
var explosion;

function preload() {
  game.load.image('starfield', 'assets/starfield.jpg');
  game.load.image('player', 'assets/spaceship.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.image('noShootingEnemy', 'assets/noShootingEnemy.png');
  game.load.image('shootingEnemy', 'assets/shootingEnemy.png');
  game.load.image('shootingEnemyBullet', 'assets/shootingEnemyBullet.png');
  game.load.image('radialShootingEnemy', 'assets/radialShootingEnemy.png');
  game.load.image('radialShootingEnemyBullet', 'assets/radialShootingEnemyBullet.png');
  game.load.image('circleShootingEnemy', 'assets/circleShootingEnemy.png');
  game.load.image('circleShootingEnemyBullet', 'assets/circleShootingEnemyBullet.png');
  game.load.image('playAgainButton', 'assets/playAgain.png');
  game.load.spritesheet('explosion', 'assets/explosion.png');
  game.load.audio('explosionSound', 'assets/explosion.mp3');
  game.load.audio('laserShotSound', 'assets/laserShotSound.mp3');
  game.load.audio('circleLaserShotSound', 'assets/circleLaserShotSound.mp3');
}

function create() {
  explosion = game.add.audio('explosionSound');
  spacefield = game.add.tileSprite(0,0,window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'starfield');
  revivePlayer();
  cursors = game.input.keyboard.createCursorKeys();
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(100, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  noShootingEnemies = game.add.group();
  shootingEnemies = game.add.group();
  shootingEnemiesBullets = game.add.group();
  radialShootingEnemies = game.add.group();
  radialEnemiesBullets = game.add.group();
  circleShootingEnemies = game.add.group();
  circleEnemiesBullets = game.add.group();

  gameOver = game.add.text(game.world.centerX, game.world.centerY * 0.8, 'GAME OVER!', { font: '84px Arial', fill: '#fff' });
  gameOver.anchor.setTo(0.5, 0.5);
  gameOver.visible = false;

  playAgain = game.add.button(game.world.centerX, game.world.centerY * 1.2, 'playAgainButton', actionOnClick, this, 2, 1, 0);
  playAgain.anchor.setTo(0.5, 0.5);
  playAgain.visible = false;

  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
}

function actionOnClick() {
  killAll(noShootingEnemies);
  killAll(shootingEnemies);
  killAll(shootingEnemiesBullets);
  killAll(radialShootingEnemies);
  killAll(radialEnemiesBullets);
  killAll(circleShootingEnemies);
  killAll(circleEnemiesBullets);
  gameOver.visible = false;
  playAgain.visible = false;
  noShootingWaveTimer.resume();
  shootingWaveTimer.resume();
  radialShootingWaveTimer.resume();
  circleShootingWaveTimer.resume();
  revivePlayer();
}

function revivePlayer() {
  player = game.add.sprite(game.world.centerX, game.world.centerY + 250, 'player');
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.setSize(10,10,35,50);
  player.body.reset(player.x, player.y)
}

function killAll(collection) {
  collection.forEach(function(group) {
    group.callAll('kill');
  });
}

function update() {
  spacefield.tilePosition.y += 5;
  playerControls();
  if (fireButton.isDown && player.alive) {
    fireBullet();
  }
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
    player.body.velocity.y = -550;
  }

  if (cursors.down.isDown && player.world.y < game.height - player.height) {
    player.body.velocity.y = 550;
  }
}

function fireBullet() {
  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);
    if (bullet) {
      var laserShotSound = game.add.audio('laserShotSound');
      laserShotSound.play();
      bullet.reset(player.x + player.width * 0.5, player.y);
      bullet.body.velocity.y = -1200;
      bulletTime = game.time.now + 100;
    }
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
    enemy.update = function() {
      game.physics.arcade.overlap(bullets, noShootingEnemiesGroup, collisionHandler, null, this);
    }
  }
  noShootingEnemiesGroup.y = -game.height * 0.3;
  noShootingEnemies.add(noShootingEnemiesGroup);
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
      enemy.health = 100;
      //  Set up firing
      var shootingEnemyBulletSpeed = 400;
      var firingDelay = 1000;
      var shootingEnemyBulletTime = 0;
      var shootingEnemyBullets = game.add.group();
      shootingEnemyBullets.enableBody = true;
      shootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
      shootingEnemyBullets.createMultiple(100, 'shootingEnemyBullet');
      shootingEnemyBullets.setAll('anchor.x', 0.5);
      shootingEnemyBullets.setAll('anchor.y', 1);
      shootingEnemyBullets.setAll('outOfBoundsKill', true);
      shootingEnemyBullets.setAll('checkWorldBounds', true);

      enemy.update = function() {
        game.physics.arcade.overlap(shootingEnemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(bullets, shootingEnemiesGroup, collisionHandler, null, this);
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
  shootingEnemies.add(shootingEnemiesGroup);
  shootingEnemiesBullets.add(shootingEnemyBullets);
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
    var radialShootingEnemyBulletSpeed = 300;
    var firingDelay = 50;
    var radialShootingEnemyBulletTime = 0;
    var radialShootingEnemyBullets = game.add.group();
    radialShootingEnemyBullets.enableBody = true;
    radialShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    radialShootingEnemyBullets.createMultiple(100, 'radialShootingEnemyBullet');
    radialShootingEnemyBullets.setAll('anchor.x', 0.5);
    radialShootingEnemyBullets.setAll('anchor.y', 1);
    radialShootingEnemyBullets.setAll('outOfBoundsKill', true);
    radialShootingEnemyBullets.setAll('checkWorldBounds', true);

    var bulletVelocityX = -180;
    var bulletVelocityY = -180;
    enemy.update = function() {
      this.angle += 1;
      game.physics.arcade.overlap(radialShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(bullets, radialShootingEnemiesGroup, collisionHandler, null, this);
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
  radialShootingEnemies.add(radialShootingEnemiesGroup);
  radialEnemiesBullets.add(radialShootingEnemyBullets);
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
    enemy.health = 200;
    //  Set up firing
    var circleShootingEnemyBulletSpeed = 300;
    var firingDelay = 3000;
    var circleShootingEnemyBulletTime = 0;
    var circleShootingEnemyBullets = game.add.group();
    circleShootingEnemyBullets.enableBody = true;
    circleShootingEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    circleShootingEnemyBullets.createMultiple(100, 'circleShootingEnemyBullet');
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
    enemy.update = function() {
      game.physics.arcade.overlap(circleShootingEnemyBullets, player, enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(bullets, circleShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= game.height / 2) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (game.time.now > circleShootingEnemyBulletTime && this.alive) {
          var amount, start, step, i, angle, speed;
          amount = 20;
          start = Math.PI * -1;
          step = Math.PI / amount * 2;
          j = amount;
          while (j > 0) {
            enemyBullet = circleShootingEnemyBullets.getFirstExists(false);
            if (enemyBullet) {
              enemyBullet.reset(this.x + circleShootingEnemiesGroup.x, this.y - game.height * 0.28);
              var angle = start + j * step;
              enemyBullet.body.velocity.x = Math.cos(angle) * circleShootingEnemyBulletSpeed;
              enemyBullet.body.velocity.y = Math.sin(angle) * circleShootingEnemyBulletSpeed;
              circleShootingEnemyBulletTime = game.time.now + firingDelay;
            }
            j--;
          }
          var circleLaserShot = game.add.audio('circleLaserShotSound');
          circleLaserShot.play();
        }
      }
    }
  }
  circleShootingEnemiesGroup.y = -game.height * 0.3;
  circleShootingEnemies.add(circleShootingEnemiesGroup);
  circleEnemiesBullets.add(circleShootingEnemyBullets);
}

function createCircleShootingEnemyGroupWave() {
  createCircleShootingEnemyGroup(game.width * 0.3);
  createCircleShootingEnemyGroup(game.width * 0.6);
}

function enemyHitsPlayer(bullet, player) {
  bullet.kill();
  player.loadTexture('explosion', 0);
  explosion.play();
  setTimeout(function() {
    player.kill();
  }, (50));
  noShootingWaveTimer.pause();
  shootingWaveTimer.pause();
  radialShootingWaveTimer.pause();
  circleShootingWaveTimer.pause();
  gameOver.visible = true;
  playAgain.visible = true;
}

function collisionHandler(bullet, enemy) {
  bullet.kill();
  var originalTint = enemy.tint;
  if (enemy.health > 0) {
    enemy.health -= 50;
    enemy.tint = 0xff3655;
  } else if (enemy.health <= 0) {
    var width = enemy.width;
    var height = enemy.height;
    enemy.loadTexture('explosion', 0);
    explosion.play();
    setTimeout(function() {
      enemy.kill();
    }, (50));
  }
  setTimeout(function() {
    enemy.tint = originalTint;
  }, (100));
}

function removeEnemy(enemy) {
  if (enemy.y > game.height) {
    enemy.kill();
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
