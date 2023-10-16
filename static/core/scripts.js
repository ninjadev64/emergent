class SpriteScriptManager {
	modules = [];

	constructor(sprite, attachedScripts) {
		Object.keys(attachedScripts).forEach(async (script) => {
			let module = await import("data:text/javascript;base64," + btoa(scripts[script]));
			this.modules.push(new (module.default)(sprite, { Body, Keyboard }, attachedScripts[script]));
		});
	}
}
