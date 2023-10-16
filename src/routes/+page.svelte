<script>
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { oneDark } from "@codemirror/theme-one-dark";

	let state = "editor";
	let iframe;
	let cw, ch;

	import { v4 as uuid } from "uuid";
	let sprites = {};
	let scripts = {};
	let modules = {};
	let selectedScript;

	let saveValue;

	import scriptPlaceholder from "/public/placeholder.js?raw";

	import GenericInspector from "../components/inspector/GenericInspector.svelte";
    import CollisionLogicInspector from "../components/inspector/CollisionLogicInspector.svelte";
	let selected;

	let inspectorName, inspectorTransform, inspectorMaterial, inspectorImage, inspectorBody, inspectorCollisionLogic;

	import { onMount } from "svelte";
	onMount(updateDomEditor);

	function updateSprites() {
		sprites = sprites;
		iframe.contentWindow.updateSprite && Object.values(sprites).forEach((sprite) => {
			iframe.contentWindow.updateSprite(sprite.id, structuredClone(sprite));
		});
	}

	function updateScripts() {
		scripts = scripts;
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
				<script src="https://cdn.jsdelivr.net/npm/eruda" onload="eruda.init();"><\/script>
				<script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"><\/script>
				<script src="/editor.js"><\/script>
				<script src="/core/render.js"><\/script>
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
				<script src="https://cdn.jsdelivr.net/npm/eruda" onload="eruda.init();"><\/script>
				<script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"><\/script>
				<script>
					sprites = JSON.parse('${JSON.stringify(sprites)}');
					scripts = ${JSON.stringify(scripts)};
				<\/script>
				<script src="/core/physics.js"><\/script>
				<script src="/core/render.js"><\/script>
				<script src="/core/keyboard.js"><\/script>
				<script src="/core/scripts.js"><\/script>
				<script src="/core/entry.js"><\/script>
			</body>
		</html>
		`);
	}

	function updateInspector(sprite) {
		selected = sprite;
		setTimeout(() => {
			inspectorName.value = sprite.name;
			inspectorTransform.updateObject(sprite.transform);
			inspectorMaterial.updateObject(sprite.render);
			inspectorImage.updateObject(sprite.render.sprite);
			inspectorBody.updateObject(sprite.body);
			inspectorCollisionLogic.updateObject(sprite.body.collisionFilter);
		}, 100);
	}

	function createSprite(type) {
		let u = uuid();
		if (sprites[u]) return;
		sprites[u] = {
			id: u,
			name: `Sprite ${Object.keys(sprites).length + 1}`,
			type,
			scripts: {},
			transform: {
				x: cw / 2, y: ch / 2,
				width: 100, height: 100
			},
			body: {
				isStatic: false,
				density: 0.001,
				friction: 0.1,
				frictionAir: 0.01,
				collisionFilter: {
					category: 1,
					mask: -1
				}
			},
			render: {
				fillStyle: "orange",
				opacity: 0.5,
				lineWidth: 0,
				sprite: {
					texture: "",
					xOffset: 0,
					yOffset: 0,
					xScale: 1,
					yScale: 1
				}
			}
		};
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
				<div class="inspector">
					<p class="font-bold"> ID </p>
					<input class="w-full" readonly value={selected.id} />
				</div>
				<GenericInspector on:update={updateSprites} name="Transform" bind:this={inspectorTransform} object={selected.transform} props={{ "x": { type: "number", name: "X" }, "y": { type: "number", name: "Y" }, "width": { type: "number", name: "Width" }, "height": { type: "number", name: "Height" } }} />
				<GenericInspector on:update={updateSprites} name="Material" bind:this={inspectorMaterial} object={selected.render} props={{ "fillStyle": { type: "text", name: "Fill style" }, "opacity": { type: "number", name: "Opacity" }, "lineWidth": { type: "number", name: "Line width" } }} />
				<GenericInspector on:update={updateSprites} name="Image" bind:this={inspectorImage} object={selected.render.sprite} props={{ "texture": { type: "text", name: "Texture path" }, "xOffset": { type: "number", name: "X offset" }, "yOffset": { type: "number", name: "Y offset" }, "xScale": { type: "number", name: "X scale" }, "yScale": { type: "number", name: "Y scale" } }} />
				<GenericInspector on:update={updateSprites} name="Body" bind:this={inspectorBody} object={selected.body} props={{ "isStatic": { type: "boolean", name: "Static" }, "density": { type: "number", name: "Density" }, "friction": { type: "number", name: "Friction" }, "frictionAir": { type: "number", name: "Air resistance" } }} />
				<CollisionLogicInspector on:update={updateSprites} bind:this={inspectorCollisionLogic} filter={selected.body.collisionFilter} />
				{#each Object.keys(selected.scripts) as script}
				<GenericInspector object={selected.scripts[script]} name={script} props={modules[script].config} selfUpdating={true}>
					<div class="flex flex-row float-right space-x-2">
						<button on:click={async () => {
							modules[script] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(scripts[script]))).default;
							modules = modules;
						}}> ⟳ </button>
						<button on:click={() => {
							delete selected.scripts[script];
							selected.scripts = selected.scripts;
						}}> × </button>
					</div>
				</GenericInspector>
				{/each}
				<div class="inspector">
					<p class="font-bold"> Add script </p>
					<select class="block w-full" on:change={async ({ target }) => {
						let defaults = {};
						if (!modules[target.value]) {
							modules[target.value] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(scripts[target.value]))).default;
						}
						Object.entries(modules[target.value].config).forEach(([key, value]) => defaults[key] = value.default);
						selected.scripts[target.value] = defaults;
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
				{#each Object.entries(sprites) as [id, sprite]}
				<div class="block p-2 cursor-pointer hover:bg-slate-700">
					<button on:click={() => updateInspector(sprite)}> {sprite.name} </button>
					<button class="float-right" on:click={() => {
						delete sprites[id];
						updateSprites();
						iframe.contentWindow.updateSprite && iframe.contentWindow.updateSprite(id, null);
					}}> × </button>
				</div>
				{/each}
			</div>
			<div class="p-4 text-slate-200">
				<button class="block" on:click={() => {
					let data = JSON.parse(atob(saveValue));
					sprites = data.sprites;
					scripts = data.scripts;
					Object.entries(scripts).forEach(async ([script, code]) => {
						modules[script] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(code))).default;
					});
					updateSprites();
					updateScripts();
				}}> Import </button>
				<button class="block" on:click={() => saveValue = btoa(JSON.stringify({ sprites, scripts }))}> Export </button>
				<input bind:value={saveValue} class="mt-2 rounded-sm bg-slate-700" />
			</div>
		</div>
	</div>
	<div class="flex flex-col grow overflow-hidden bg-slate-800">
		<div class="flex flex-row px-1 pt-1 text-slate-300 border-slate-500 border-b">
			{#each Object.keys(scripts) as script}
			<button class="inline p-2 min-w-[72px] bg-slate-800 border-slate-500 border-x border-t rounded-t-lg" on:click={() => {
				selectedScript = script;
				updateScripts();
			}}> {script} </button>
			{/each}
			<button class="inline p-2 bg-slate-600 border-slate-500 border-x border-t rounded-t-lg" on:click={() => {
				let script = prompt("Script name:");
				if (!script) return;
				scripts[script] = scriptPlaceholder;
				selectedScript = script;
				updateScripts();
			}}> Add script </button>
		</div>
		{#if selectedScript}
		<CodeMirror bind:value={scripts[selectedScript]} on:change={updateScripts} lang={javascript()} theme={oneDark} useTab={true} lineWrapping={true} tabSize={4} class="grow" styles={{"&": { height: "100%" }}}/>
		{:else}
		<div class="p-2 text-slate-300"> Create a script to get started! </div>
		{/if}
	</div>
</div>
