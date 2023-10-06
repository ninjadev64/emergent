const Keyboard = new (class {
	constructor() {
		this.pressedKeys = {};
		window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }
		window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }
	}

	pressing(keyCode) {
		return this.pressedKeys[keyCode];
	}
});