var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

var spacefield;
var player;
var cursors;

function preload() {
  game.load.image('starfield', 'assets/starfield.jpg');
  game.load.image('player', 'assets/spaceship.png');
}

function create() {
  spacefield = game.add.tileSprite(0,0,window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'starfield');
  player = game.add.sprite(game.world.centerX, game.world.centerY + 250, 'player');
  player.scale.setTo(0.4, 0.4);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  spacefield.tilePosition.y += 5;
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
