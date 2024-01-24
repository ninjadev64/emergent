<script>
	import LightningFS from "@isomorphic-git/lightning-fs";
	
	export let data;
	let cfs, fs;
	let loadingComplete = false;

	function getFS() {
		return cfs;
	}

	let state = "editor";
	let iframe;
	let cw, ch;

	import { v4 as uuid } from "uuid";
	let sprites = {};
	let scripts = {};
	let modules = {};

	async function load() {
		// Load every sprite from the filesystem into the sprites object
		for (let sprite of await fs.readdir("/sprites")) {
			const data = JSON.parse((await fs.readFile(`/sprites/${sprite}`)).toString("utf-8"));
			sprite = sprite.slice(0, -5);
			sprites[sprite] = data;
		}
		updateSprites();

		// Load every script from the filesystem into the scripts object
		for (const script of await fs.readdir("/scripts")) {
			const code = (await fs.readFile(`/scripts/${script}`)).toString("utf-8");
			scripts[script.slice(0, -3)] = code;
			modules[script.slice(0, -3)] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(code))).default;
		}
		updateScripts();
	}
	
	async function save() {
		// Delete any files of sprites that no longer exist
		for (const sprite of await fs.readdir("/sprites")) {
			if (!sprites[sprite.slice(0, -5)]) await fs.unlink(`/sprites/${sprite}`);
		}
		// Write each sprite's data to a file
		for (const [ id, data ] of Object.entries(sprites)) {
			fs.writeFile(`/sprites/${id}.json`, JSON.stringify(data));
		}

		// Delete any files of scripts that no longer exist
		for (const script of await fs.readdir("/scripts")) {
			if (!scripts[script.slice(0, -3)]) await fs.unlink(`/scripts/${script}`);
		}
		// Write each script's data to a file
		for (const [ id, code ] of Object.entries(scripts)) {
			fs.writeFile(`/scripts/${id}.js`, code);
		}
	}

	let selected;
	let inspector;

	let gitView;

	import Icon from "/src/components/Icon.svelte";
	import Inspector from "/src/components/inspector/Inspector.svelte";
	import ScriptEditor from "/src/components/ScriptEditor.svelte";
    import ListedSprite from "/src/components/ListedSprite.svelte";
    import GitView from "/src/components/GitView.svelte";
	
	import { onMount } from "svelte";
	onMount(async () => {
		updateDomEditor();
		cfs = new LightningFS(`${data.user}/${data.repo}`);
		fs = cfs.promises;
		await gitView.init(cfs);
		fs.mkdirIfNotExists = async (path) => {
			try {
				await fs.mkdir(path);
			} catch {}
		}
		await fs.mkdirIfNotExists("/sprites");
		await fs.mkdirIfNotExists("/scripts");
		await load();
		loadingComplete = true;
	});

	function updateSprite(id) {
		sprites = sprites;
		iframe.contentWindow.updateSprite && iframe.contentWindow.updateSprite(id, structuredClone(sprites[id]));
	}

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

	function createSprite(type, parent) {
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
			},
			isTopLevel: true,
			children: []
		};
		if (parent) {
			sprites[u].isTopLevel = false;
			sprites[u].body.isStatic = true;
			parent.children = [ ...parent.children, u ];
		}
		updateSprites();
	}
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
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
		<Icon rel="floppy-disk-back" width="36px" role="button" on:click={save} />
		<Icon rel="folders" width="36px" role="button" on:click={() => window.location.href = "/projects"} />
		<Icon rel="sign-out" width="36px" role="button" on:click={() => window.location.href = "/logout"} />
	</span>
</div>

<!-- Editor -->
<div class="flex flex-row" style="height: calc(100vh - 48px);">
	<!-- Left panel -->
	<div class="flex flex-col grow bg-slate-300">
		<!-- Game view and inspector -->
		<div class="h-[65%] flex flex-row">
			<!-- Game view -->
			<iframe on:load={updateSprites} bind:this={iframe} class="grow" bind:clientWidth={cw} bind:clientHeight={ch} title="Game view" />
			
			<!-- Inspector -->
			<div class="min-w-[30%] p-4 space-y-4 overflow-auto bg-slate-600 text-slate-200">
				{#if selected}
					<Inspector bind:this={inspector} sprite={selected} scripts={scripts} modules={modules}
						on:update={() => {
							updateSprites();
							updateScripts();
						}}
						on:createChild={({ detail: type }) => {
							createSprite(type, selected);
						}}
					/>
				{:else}
					No sprite selected
				{/if}
			</div>
		</div>

		<!-- Assets panel -->
		<div class="flex flex-row h-[35%] bg-slate-500">
			<!-- Sprite list -->
			<div class="w-1/3 p-4 bg-slate-600 text-slate-200 overflow-auto">
				<div class="pb-2 mb-4 border-b-2">
					<button class="block" on:click={() => createSprite("rect")}> + Rectangle </button>
					<button class="block" on:click={() => createSprite("circle")}> + Circle </button>
				</div>
				{#each Object.values(sprites) as sprite}{#if loadingComplete && sprite.isTopLevel}
					<ListedSprite sprites={sprites} sprite={sprite} selected={selected ? selected.id : ""}
						on:select={({ detail: id }) => {
							selected = sprites[id];
							if (!inspector) setTimeout(() => inspector.updateSprite(selected), 100);
							else inspector.updateSprite(selected);
						}}
						on:remove={({ detail: id }) => {
							if (selected && selected.id == id) selected = null;
							delete sprites[id];
							updateSprites();
							iframe.contentWindow.updateSprite && iframe.contentWindow.updateSprite(id, null);
						}}
					/>
				{/if}{/each}
			</div>

			<!-- Import/export -->
			<div class="w-full p-4 text-slate-200">
				<GitView bind:this={gitView} fs={getFS} user={data.user} repo={data.repo} accessToken={data.access_token} save={save} />
			</div>
		</div>
	</div>

	<!-- Script editor -->
	<ScriptEditor scripts={scripts} on:update={updateScripts} />
</div>
