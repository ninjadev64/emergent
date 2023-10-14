class Sprite {
	id;
	body;

	constructor(configurator) {
		this.id = configurator.id;
		this.body = new SpriteBody(this, configurator.type, configurator.transform, configurator.body, configurator.render);
		this.scripting = new SpriteScriptManager(this, configurator.scripts);
	}
}

Object.values(sprites).forEach((sprite) => new Sprite(sprite));