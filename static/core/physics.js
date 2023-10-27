const physicsEngine = new (class PhysicsEngine {
	engine;
	runner;
	bodies = {};
	children = [];
	updateListeners = [];
	
	constructor() {
		this.engine = Matter.Engine.create();
		this.runner = Matter.Runner.create();
		Matter.Runner.run(this.runner, this.engine);

		Matter.Events.on(this.engine, "beforeUpdate", () => {
			this.children.forEach((o) => {
				const { parent, child } = o;
				Matter.Body.setPosition(child, Matter.Vector.create(
					child.position.x + (parent.position.x - o.oldParentPosition.x),
					child.position.y + (parent.position.y - o.oldParentPosition.y)
				));
				o.oldParentPosition = {
					x: parent.position.x,
					y: parent.position.y
				};
			});
		})

		Matter.Events.on(this.engine, "afterUpdate", () => {
			this.updateListeners.forEach((listener) => listener.updateListener());
			if (typeof Keyboard == "object") Keyboard.clear();
		});
	}

	createBody(id, type, transform, body, render, parentSprite, updateListener) {
		switch (type) {
			case "rect": {
				this.bodies[id] = Matter.Bodies.rectangle(
					transform.x, transform.y, transform.width, transform.height, 
					{ ...body, render: render }
				);
				break;
			}
			case "circle": {
				this.bodies[id] = Matter.Bodies.circle(
					transform.x, transform.y, transform.width / 2,
					{ ...body, render: render }
				);
				break;
			}
		}
		if (parentSprite) this.children.push({
			parent: this.bodies[parentSprite.id],
			child: this.bodies[id],
			oldParentPosition: {
				x: parentSprite.body.position.x,
				y: parentSprite.body.position.y
			}
		});
		Matter.Composite.add(this.engine.world, this.bodies[id]);
		this.updateListeners.push(updateListener);
		return this.bodies[id];
	}
})();

class SpriteBody {
	#sprite;
	#body;

	constructor(sprite, type, transform, body, render) {
		this.#sprite = sprite;
		this.#body = physicsEngine.createBody(sprite.id, type, transform, body, render, sprite.parent, this);
	}

	updateListener() {
		(this.#sprite.scripting.modules ?? []).forEach((module) => module.update());
	}

	getVelocity() {
		return Matter.Body.getVelocity(this.#body);
	}

	setVelocity({ x = this.#body.velocity.x, y = this.#body.velocity.y }) {
		Matter.Body.setVelocity(this.#body, Matter.Vector.create(x, y));
	}

	applyForce({ x: mx = 0, y: my = 0 } = {}, { x: px = this.#body.position.x, y: py = this.#body.position.y } = {}) {
		Matter.Body.applyForce(this.#body, Matter.Vector.create(px, py), Matter.Vector.create(mx, my));
	}

	setPosition({ x, y }, updateVelocity = false) {
		Matter.Body.setPosition(this.#body, Matter.Vector.create(x, y), updateVelocity);
	}

	get position() {
		return this.#body.position;
	}

	translate({ x, y }, updateVelocity = false) {
		Matter.Body.translate(this.#body, Matter.Vector.create(x, y), updateVelocity);
	}

	rotate(rotation, { x = this.#body.position.x, y = this.#body.position.y } = {}, updateVelocity = false) {
		Matter.Body.rotate(this.#body, rotation, Matter.Vector.create(x, y), updateVelocity);
	}

	setAngle(angle, updateVelocity = false) {
		Matter.Body.setAngle(this.#body, angle, updateVelocity);
	}

	setAngularVelocity(velocity) {
		Matter.Body.setAngularVelocity(this.#body, velocity);
	}

	setCentre({ x = this.#body.position.x, y = this.#body.position.y }, relative) {
		Matter.Body.setCentre(this.#body, Matter.Vector.create(x, y), relative);
	}

	setDensity(density) {
		Matter.Body.setDensity(this.#body, density);
	}

	setStatic(isStatic) {
		Matter.Body.setStatic(this.#body, isStatic);
	}

	scale(scaleX, scaleY, { x = this.#body.position.x, y = this.#body.position.y } = {}) {
		Matter.Body.scale(this.#body, scaleX, scaleY, Matter.Vector.create(x, y));
	}
}

class Body {
	static collides(a, b) {
		return Matter.Collision.collides(physicsEngine.bodies[typeof a == "object" ? a.id : sprites[a].id], physicsEngine.bodies[typeof b == "object" ? b.id : sprites[b].id]);
	}
}
