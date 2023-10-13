let sprites = [];

const engine = Matter.Engine.create();
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

let bodies = {};

function createSprite(id, sprite) {
	const t = sprite.transform;
	switch (sprite.type) {
		case "rect": {
			bodies[id] = Matter.Bodies.rectangle(t.x, t.y, t.width, t.height, { isStatic: true, render: structuredClone(sprite.render) });
			break;
		}
		case "ellipse": {
			bodies[id] = Matter.Bodies.circle(t.x, t.y, t.width / 2, { isStatic: true, render: structuredClone(sprite.render) });
			break;
		}
	}
	Matter.Composite.add(engine.world, bodies[id]);
}

function updateSprite(s) {
	if (bodies[s.id]) {
		Matter.Composite.remove(engine.world, bodies[s.id]);
		delete bodies[s.id];
	}
	createSprite(s.id, s);
}
