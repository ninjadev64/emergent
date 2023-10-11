const engine = Matter.Engine.create();
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

let bodies = {};

function createSprite(id, sprite) {
	const t = sprite.transform;
	switch (sprite.type) {
		case "rect": {
			bodies[id] = Matter.Bodies.rectangle(t.x, t.y, t.width, t.height, sprite.body);
			break;
		}
		case "ellipse": {
			bodies[id] = Matter.Bodies.circle(t.x, t.y, t.width / 2, sprite.body);
			break;
		}
	}
	Matter.Composite.add(engine.world, bodies[id]);
}
for (const [id, sprite] of Object.entries(sprites)) {
	createSprite(id, sprite);
}

Matter.Events.on(engine, "afterUpdate", () => {
	Object.values(sprites).forEach((sprite) => {
		sprite.transform.x = bodies[sprite.id].position.x;
		sprite.transform.y = bodies[sprite.id].position.y;
		(sprite.modules ?? []).forEach((module) => module.update());
	});
	if (Keyboard.clear) Keyboard.clear();
});

const Body = new (class {
	getVelocity(sprite) {
		return Matter.Body.getVelocity(bodies[sprite.id]);
	}

	setVelocity(sprite, { x = bodies[sprite.id].velocity.x, y = bodies[sprite.id].velocity.y }) {
		Matter.Body.setVelocity(bodies[sprite.id], Matter.Vector.create(x, y));
	}

	applyForce(sprite, { x: mx = 0, y: my = 0 } = {}, { x: px = bodies[sprite.id].position.x, y: py = bodies[sprite.id].position.y } = {}) {
		Matter.Body.applyForce(bodies[sprite.id], Matter.Vector.create(px, py), Matter.Vector.create(mx, my));
	}

	setPosition(sprite, { x, y }, updateVelocity = false) {
		Matter.Body.setPosition(bodies[sprite.id], Matter.Vector.create(x, y), updateVelocity);
	}

	translate(sprite, { x, y }, updateVelocity = false) {
		Matter.Body.translate(bodies[sprite.id], Matter.Vector.create(x, y), updateVelocity);
	}

	rotate(sprite, rotation, { x = bodies[sprite.id].position.x, y = bodies[sprite.id].position.y } = {}, updateVelocity = false) {
		Matter.Body.rotate(bodies[sprite.id], rotation, Matter.Vector.create(x, y), updateVelocity);
	}

	setAngle(sprite, angle, updateVelocity = false) {
		Matter.Body.setAngle(bodies[sprite.id], angle, updateVelocity);
	}

	setAngularVelocity(sprite, velocity) {
		Matter.Body.setAngularVelocity(bodies[sprite.id], velocity);
	}

	setCentre(sprite, { x = bodies[sprite.id].position.x, y = bodies[sprite.id].position.y }, relative) {
		Matter.Body.setCentre(bodies[sprite.id], Matter.Vector.create(x, y), relative);
	}

	setDensity(sprite, density) {
		Matter.Body.setDensity(bodies[sprite.id], density);
	}

	setStatic(sprite, isStatic) {
		Matter.Body.setStatic(bodies[sprite.id], isStatic);
	}

	scale(sprite, scaleX, scaleY, { x = bodies[sprite.id].position.x, y = bodies[sprite.id].position.y } = {}) {
		Matter.Body.scale(bodies[sprite.id], scaleX, scaleY, Matter.Vector.create(x, y));
	}

	collides(a, b) {
		return Matter.Collision.collides(bodies[typeof a == "object" ? a.id : sprites[a].id], bodies[typeof b == "object" ? b.id : sprites[b].id]);
	}
})();
