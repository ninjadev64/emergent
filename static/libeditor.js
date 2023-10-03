let sprites = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
}

function acceptSprites(s) {
	sprites = s;
}

function drawSprite(sprite) {
	const t = sprite.transform;
	switch (sprite.type) {
		case "rect": {
			rect(t.pos.x - (t.width / 2), t.pos.y - (t.height / 2), t.width, t.height);
			break;
		}
		case "ellipse": {
			ellipse(t.pos.x, t.pos.y, t.width, t.height);
			break;
		}
	}
}

function draw() {
	clear();
	sprites.forEach(drawSprite);
}
