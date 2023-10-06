const engine = Matter.Engine.create();
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);

function createSprite(sprite) {
	const t = sprite.transform;
	switch (sprite.type) {
		case "rect": {
			sprite.matterBody = Matter.Bodies.rectangle(t.x, t.y, t.width, t.height, sprite.body);
			break;
		}
		case "ellipse": {
			sprite.matterBody = Matter.Bodies.circle(t.x, t.y, t.width / 2, sprite.body);
			break;
		}
	}
	Matter.Composite.add(engine.world, sprite.matterBody);
}
sprites.forEach(createSprite);

Matter.Events.on(runner, "afterTick", () => {
	sprites.forEach((sprite) => {
		sprite.transform.x = sprite.matterBody.position.x;
		sprite.transform.y = sprite.matterBody.position.y;
	});
});

const Body = new (class {
	setVelocity(sprite, { x = sprite.matterBody.velocity.x, y = sprite.matterBody.velocity.y }) {
		Matter.Body.setVelocity(sprite.matterBody, Matter.Vector.create(x, y));
	}
})();