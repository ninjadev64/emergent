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
			rect(t.x - (t.width / 2), t.y - (t.height / 2), t.width, t.height);
			break;
		}
		case "ellipse": {
			ellipse(t.x, t.y, t.width, t.height);
			break;
		}
	}
}

function draw() {
	clear();
	Object.values(sprites).forEach(drawSprite);
}
