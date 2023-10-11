const Keyboard = new (class {
	constructor() {
		this.pressedKeys = {};
		this.frameDown = [];
		this.frameUp = [];
		window.onkeydown = (e) => {
			this.pressedKeys[e.keyCode] = true;
			this.frameDown.push(e.keyCode);
		}
		window.onkeyup = (e) => {
			this.pressedKeys[e.keyCode] = false;
			this.frameUp.push(e.keyCode);
		}
	}

	clear() {
		this.frameDown = [];
		this.frameUp = [];
	}

	pressing(keyCode) {
		return this.pressedKeys[keyCode];
	}

	keyDown(keyCode) {
		return this.frameDown.includes(keyCode);
	}

	keyUp(keyCode) {
		return this.frameUp.includes(keyCode);
	}
});
