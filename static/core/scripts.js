Object.values(sprites).forEach((sprite) => {
	sprite.modules = [];
	sprite.scripts.forEach(async (script) => {
		let module = await import("data:text/javascript;base64," + btoa(scripts[script]));
		sprite.modules.push(new (module.default)(sprite, { Body, Keyboard }));
	});
});
