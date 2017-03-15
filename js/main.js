var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

var spacefield;

function preload() {
  game.load.image('starfield', 'assets/starfield.jpg');
}

function create() {
  spacefield = game.add.tileSprite(0,0,800,600, 'starfield');
}

function update() {
  spacefield.tilePosition.y += 5;
}
