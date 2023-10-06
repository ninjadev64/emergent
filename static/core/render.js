function setup() {
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
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
	modules.forEach(async (module) => module.update());
	sprites.forEach(drawSprite);
}

