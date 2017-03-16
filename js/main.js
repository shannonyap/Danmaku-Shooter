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
  game.load.image('enemy', 'assets/enemy.png');
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
  timer.loop(5000, createEnemyGroup1, this);
  timer.start();
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
    player.body.velocity.x = -350;
  }

  if (cursors.right.isDown && player.world.x < game.width - player.width) {
    player.body.velocity.x = 350;
  }

  if (cursors.up.isDown && player.world.y > 0) {
    player.body.velocity.y = -350;
  }

  if (cursors.down.isDown && player.world.y < game.height - player.height) {
    player.body.velocity.y = 350;
  }
}

function fireBullet() {
  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {
      bullet.reset(player.x + game.width * 0.0325, player.y);
      bullet.body.velocity.y = -1200;
      bulletTime = game.time.now + 100;
    }
  }
}

function createEnemyGroup1() {
  var enemiesGroup1 = game.add.group();
  enemiesGroup1.enableBody = true;
  enemiesGroup1.physicsBodyType = Phaser.Physics.ARCADE;
  for (var i = 0; i < 5; i++) {
      var enemy = enemiesGroup1.create(10, i * 40, 'enemy');
      enemy.scale.setTo(0.05, 0.05);
      enemy.anchor.setTo(0.5, 0.5);
      enemy.body.velocity.y = 200;
      enemy.checkWorldBounds = true;
      enemy.events.onOutOfBounds.add(removeEnemy, this);
  }
  enemiesGroup1.x = getRandomInt(0, game.width);
  enemiesGroup1.y = -game.height * 0.3;
}

function removeEnemy(enemy) {
  if (enemy.y > game.height) {
    enemy.kill();
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
