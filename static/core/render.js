let e;
if (typeof physicsEngine == "object") {
	e = physicsEngine.engine;
} else {
	e = engine;
}

const render = Matter.Render.create({
    element: document.body,
    engine: e,
	options: {
		wireframes: false,
		background: "transparent",
		width: document.body.clientWidth,
		height: document.body.clientHeight
	}
});
Matter.Render.run(render);