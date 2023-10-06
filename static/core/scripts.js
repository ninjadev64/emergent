sprites.forEach((sprite) => {
	sprite.scripts.forEach(async (script) => {
		let module = await import("data:text/javascript;base64," + btoa(scripts[script]));
		modules.push(new (module.default)(sprite, { Body, Keyboard }));
	});
});
