var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

var spacefield;
var player;
var cursors;

var bullets;
var bulletTime = 0;
var fireButton;

function preload() {
  game.load.image('starfield', 'assets/starfield.jpg');
  game.load.image('player', 'assets/spaceship.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.image('noShootingEnemy', 'assets/noShootingEnemy.png');
  game.load.image('shootingEnemy', 'assets/shootingEnemy.png');
  game.load.image('shootingEnemyBullet', 'assets/shootingEnemyBullet.png');
  game.load.image('radialShootingEnemy', 'assets/radialShootingEnemy.png');
  game.load.image('radialShootingEnemyBullet', 'assets/radialShootingEnemyBullet.png');
}

function create() {
  spacefield = game.add.tileSprite(0,0,window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'starfield');
  player = game.add.sprite(game.world.centerX, game.world.centerY + 250, 'player');
  player.scale.setTo(0.4, 0.4);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  cursors = game.input.keyboard.createCursorKeys();

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(100, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  var timer = game.time.create(false);
  timer.loop(getRandomInt(3000, 7001), createNoShootingEnemyGroup, this);
  timer.start();

  var timer2 = game.time.create(false);
  timer2.loop(getRandomInt(4000, 8001), createShootingEnemyGroup, this);
  timer2.start();

  var timer3 = game.time.create(false);
  timer3.loop(getRandomInt(6000, 10001), createRadialShootingEnemyGroupWave, this);
  timer3.start();

}

function update() {
  spacefield.tilePosition.y += 5;
  playerControls();
  if (fireButton.isDown) {
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
      bullet.reset(player.x + player.width * 0.5, player.y);
      bullet.body.velocity.y = -1200;
      bulletTime = game.time.now + 100;
    }
  }
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
        game.physics.arcade.overlap(bullets, shootingEnemiesGroup, collisionHandler, null, this);
        if (game.time.now > shootingEnemyBulletTime && enemy.alive) {
          enemyBullet = shootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(shootingEnemiesGroup.x, this.y - this.width * 4.5);
            var angle = game.physics.arcade.moveToObject(enemyBullet, player, shootingEnemyBulletSpeed);
            enemyBullet.angle = game.math.radToDeg(angle);
            shootingEnemyBulletTime = game.time.now + firingDelay;
          }
        }
      }
  }
  shootingEnemiesGroup.x = getRandomInt(0, game.width);
  shootingEnemiesGroup.y = -game.height * 0.3;
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

    //  Set up firing
    var radialShootingEnemyBulletSpeed = 300;
    var firingDelay = 100;
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
      game.physics.arcade.overlap(bullets, radialShootingEnemiesGroup, collisionHandler, null, this);
      if (this.y - this.height >= game.height / 2 + this.height) {
        this.body.velocity.y = 0;
      }
      if (this.body.velocity.y == 0) {
        if (game.time.now > radialShootingEnemyBulletTime && this.alive) {
          enemyBullet = radialShootingEnemyBullets.getFirstExists(false);
          if (enemyBullet) {
            enemyBullet.reset(radialShootingEnemiesGroup.x, this.y - 200);
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
}

function createRadialShootingEnemyGroupWave() {
  createRadialShootingEnemyGroup();
  createRadialShootingEnemyGroup();
}

function collisionHandler(bullet, enemy) {
  bullet.kill();
  enemy.kill();
}

function removeEnemy(enemy) {
  if (enemy.y > game.height) {
    enemy.kill();
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
