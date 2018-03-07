function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
	this.bgAnimation = new Animation(ASSET_MANAGER.getAsset("./img/dance-floor.png"), 0, 0, 1500, 855, 0.4, 2, true, false);
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    //ctx.fillStyle = "SaddleBrown";
    //ctx.fillRect(0,500,800,300);
	this.bgAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function MJ(game) {
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/MJ.png"), 0, 0, 35.2, 82, 0.12, 8, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spin-kick.png"), 0, 0, 46, 78, 0.08, 15, true, false);
	this.speed = 100;
	this.jumping = false;
	this.walking = true;
	this.ground = 400;
	Entity.call(this, game, 0, this.ground);
}

MJ.prototype = new Entity();
MJ.prototype.constructor = MJ;

MJ.prototype.update = function () {
    if (this.game.space) {
		this.jumping = true;
		this.walking = false;
	}
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
			this.walking = true;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 50;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
	this.x += this.game.clockTick * this.speed;
    if (this.x > 1500) this.x = -130;
    Entity.prototype.update.call(this);
}

MJ.prototype.draw = function (ctx) {
	if (this.walking) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 5);
    } else {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 5);
    }
    
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/MJ.png");
ASSET_MANAGER.queueDownload("./img/spin-kick.png");
ASSET_MANAGER.queueDownload("./img/dance-floor.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var mj = new MJ(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(mj);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
