class Sprite {
	id;
	body;
	parent = null;

	constructor(configurator, parent) {
		this.id = configurator.id;
		if (parent) this.parent = parent;
		this.body = new SpriteBody(this, configurator.type, configurator.transform, configurator.body, configurator.render);
		this.scripting = new SpriteScriptManager(this, configurator.scripts);
		configurator.children.forEach((child) => new Sprite(sprites[child], this));
	}
}

Object.values(sprites).forEach((sprite) => {
	if (sprite.isTopLevel) new Sprite(sprite, null);
});
