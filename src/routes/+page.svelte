<script>
	let state = "editor";
	let iframe;
	let cw, ch;

	import { v4 as uuid } from "uuid";
	let sprites = {};
	let scripts = {};
	let modules = {};

	let selected;
	let inspector;

	let saveValue;

	import Inspector from "../components/inspector/Inspector.svelte";
	import ScriptEditor from "../components/ScriptEditor.svelte";
	
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

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/eruda" onload="eruda.init();"></script>
</svelte:head>

<!-- Navbar -->
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

<!-- Editor -->
<div class="flex flex-row" style="height: calc(100vh - 48px);">
	<!-- Left panel -->
	<div class="w-[65%] h-full flex flex-col bg-slate-300">
		<!-- Game view and inspector -->
		<div class="h-[65%] flex flex-row">
			<!-- Game view -->
			<iframe bind:this={iframe} class="grow" bind:clientWidth={cw} bind:clientHeight={ch} title="Game view" />
			
			<!-- Inspector -->
			<div class="min-w-[30%] p-4 space-y-4 overflow-auto bg-slate-600 text-slate-200">
				{#if selected}
				<Inspector bind:this={inspector} on:update={() => {
					updateSprites();
					updateScripts();
				}} sprite={selected} scripts={scripts} modules={modules} />
				{:else}
				No sprite selected
				{/if}
			</div>
		</div>

		<!-- Assets panel -->
		<div class="flex flex-row grow bg-slate-500">
			<!-- Sprite list -->
			<div class="w-1/3 p-4 bg-slate-600 text-slate-200">
				<div class="pb-2 mb-4 border-b-2">
					<button class="block" on:click={() => createSprite("rect")}> + Square </button>
					<button class="block" on:click={() => createSprite("ellipse")}> + Circle </button>
				</div>
				{#each Object.entries(sprites) as [ id, sprite ]}
				<div class="block p-2 cursor-pointer hover:bg-slate-700">
					<button on:click={() => {
						selected = sprite;
						if (!inspector) {
							setTimeout(() => inspector.updateSprite(sprite), 100);
						} else {
							inspector.updateSprite(sprite);
						}
					}}> {sprite.name} </button>
					<button class="float-right" on:click={() => {
						if (selected.id == id) selected = null;
						delete sprites[id];
						updateSprites();
						iframe.contentWindow.updateSprite && iframe.contentWindow.updateSprite(id, null);
					}}> × </button>
				</div>
				{/each}
			</div>

			<!-- Import/export -->
			<div class="p-4 text-slate-200">
				<button class="block" on:click={() => {
					let data = JSON.parse(atob(saveValue));
					sprites = data.sprites;
					scripts = data.scripts;
					Object.entries(scripts).forEach(async ([ script, code ]) => {
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

	<!-- Script editor -->
	<ScriptEditor scripts={scripts} on:update={updateScripts} />
</div>
