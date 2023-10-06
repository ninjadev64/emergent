<script>
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { oneDark } from "@codemirror/theme-one-dark";
	let value = "";

	let state = "editor";
	let iframe;
	let cw, ch;

	let sprites = [];
	let scripts = { "main": value };

	import Inspector from "../components/inspector/Inspector.svelte";
	let selected;

	let inspectorName;
	let inspectorTransform;
	let inspectorBody;

	import { onMount } from "svelte";
	onMount(updateDomEditor);

	function updateSprites() {
		sprites = sprites;
		iframe.contentWindow.acceptSprites && iframe.contentWindow.acceptSprites(sprites);
	}

	function updateScripts() {
		scripts["main"] = value;
	}

	function updateDomEditor() {
		state = "editor";
		iframe.setAttribute("srcdoc", `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<link rel="stylesheet" href="/embedded.css" />
			</head>
			<body>
				<script type="text/javascript" src="https://unpkg.com/default-passive-events"><\/script>
				<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"><\/script>
				<script src="/libeditor.js"><\/script>
			</body>
		</html>
		`);
		setTimeout(updateSprites, 100);
	}

	function updateDomRun() {
		state = "run";
		iframe.setAttribute("srcdoc", `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<link rel="stylesheet" href="/embedded.css" />
			</head>
			<body>
				<script type="text/javascript" src="https://unpkg.com/default-passive-events"><\/script>
				<script src="https://cdn.jsdelivr.net/npm/p5@1/lib/p5.min.js"><\/script>
				<script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"><\/script>
				<script>
					sprites = JSON.parse('${JSON.stringify(sprites)}');
					scripts = ${JSON.stringify(scripts)};
				<\/script>
				<script src="/core/globals.js"><\/script>
				<script src="/core/physics.js"><\/script>
				<script src="/core/render.js"><\/script>
				<script src="/core/keyboard.js"><\/script>
				<script src="/core/scripts.js"><\/script>
			</body>
		</html>
		`);
	}

	function updateInspector(sprite) {
		selected = sprite;
		setTimeout(() => {
			inspectorName.value = sprite.name;
			inspectorTransform.updateObject(sprite.transform);
			inspectorBody.updateObject(sprite.body);
		}, 100);
	}

	function createSprite(type) {
		sprites.push({
			name: `Sprite ${sprites.length + 1}`,
			type,
			scripts: [],
			transform: {
				x: cw / 2, y: ch / 2,
				width: 100, height: 100
			},
			body: {
				isStatic: false,
				density: 0.001,
				friction: 0.1,
				frictionAir: 0.01
			}
		});
		updateSprites();
	}
</script>

<div class="w-full h-[48px] p-4 flex justify-between items-center font-bold text-white">
	<div class="flex items-center space-x-2 text-2xl">
		<img class="h-7" src="/favicon.png" alt="Emergent logo" />
		<h1> Emergent </h1>
	</div>
	{#if state == "editor"}
	<button on:click={updateDomRun}> Run </button>
	{:else}
	<button on:click={updateDomEditor}> Stop </button>
	{/if}
	<span class="space-x-4">
		<span> Projects </span>
		<span> Account </span>
	</span>
</div>

<div class="flex flex-row" style="height: calc(100vh - 48px);">
	<div class="w-[65%] h-full flex flex-col bg-slate-300">
		<div class="h-[65%] flex flex-row">
			<iframe bind:this={iframe} class="grow" bind:clientWidth={cw} bind:clientHeight={ch} title="Output" />
			<div class="min-w-[30%] p-4 space-y-4 overflow-auto bg-slate-600 text-slate-200">
				{#if selected}
				<span class="block font-bold"> {selected.name} </span>
				<div class="inspector">
					<p class="font-bold"> Name </p>
					<input class="w-full" type="text" bind:this={inspectorName} on:change={({ target }) => {
						selected.name = target.value;
						updateSprites();
					}} />
				</div>
				<Inspector bind:this={inspectorTransform} object={selected.transform} name="Transform" props={{ "x": { type: "number", name: "X" }, "y": { type: "number", name: "Y" }, "width": { type: "number", name: "Width" }, "height": { type: "number", name: "Height" } }} on:update={updateSprites} />
				<Inspector bind:this={inspectorBody} object={selected.body} name="Body" props={{ "isStatic": { type: "boolean", name: "Static" }, "density": { type: "number", name: "Density" }, "friction": { type: "number", name: "Friction" }, "frictionAir": { type: "number", name: "Air resistance" } }} on:update={updateSprites} />
				{#each selected.scripts as script}
				<div class="inspector">{script}</div>
				{/each}
				<div class="inspector">
					<p class="font-bold"> Add script </p>
					<select class="block w-full" on:change={({ target }) => {
						selected.scripts.push(target.value);
						selected.scripts = selected.scripts;
						target.value = "emergent_placeholderoption";
						updateScripts();
					}}>
						<option value="emergent_placeholderoption" disabled selected> Select a script... </option>
						{#each Object.keys(scripts) as script}
						<option value={script}> {script} </option>
						{/each}
					</select>
				</div>
				{:else}
				No sprite selected
				{/if}
			</div>
		</div>
		<div class="flex flex-row grow bg-slate-500">
			<div class="w-1/3 p-4 bg-slate-600 text-slate-200">
				<div class="pb-2 mb-4 border-b-2">
					<button class="block" on:click={() => createSprite("rect")}> + Square </button>
					<button class="block" on:click={() => createSprite("ellipse")}> + Circle </button>
				</div>
				{#each sprites as sprite}
				<div class="block p-2 cursor-pointer hover:bg-slate-700">
					<button on:click={() => updateInspector(sprite)}> {sprite.name} </button>
				</div>
				{/each}
			</div>
			<div class="p-4 text-slate-200">
				<button class="block" on:click={() => {
					let data = JSON.parse(atob(prompt("Code: ")));
					sprites = data.sprites;
					scripts = data.scripts;
					value = scripts["main"];
					updateSprites();
					updateScripts();
				}}> Import </button>
				<button class="block" on:click={() => prompt("Exported value:", btoa(JSON.stringify({ sprites, scripts })))}> Export </button>
			</div>
		</div>
	</div>
	<div class="flex flex-row grow gap-2 overflow-hidden">
		<CodeMirror bind:value on:change={updateScripts} lang={javascript()} theme={oneDark} useTab={true} tabSize={4} class="grow" styles={{"&": { height: "100%" }}}/>
	</div>
</div>