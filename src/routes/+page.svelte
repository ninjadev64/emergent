<script>
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { oneDark } from "@codemirror/theme-one-dark";
	let value = "";

	let iframe;
	let cw, ch;

	let sprites = [];

	let selected;

	let inspectorX;
	let inspectorY;

	import { onMount } from "svelte";
	onMount(updateDom);

	function updateSprites() {
		iframe.contentWindow.acceptSprites && iframe.contentWindow.acceptSprites(sprites);
	}

	function updateDom() {
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

	function updateInspector(sprite) {
		selected = sprite;
		setTimeout(() => {
			inspectorX.value = sprite.transform.pos.x;
			inspectorY.value = sprite.transform.pos.y;
		}, 100);
	}

	function createSprite(type) {
		sprites = [...sprites, { name: `Sprite ${sprites.length + 1}`, type, transform: { pos: { x: cw / 2, y: ch / 2 }, width: 100, height: 100 } }];
		updateSprites();
	}
</script>

<div class="w-full h-[48px] p-4 flex justify-between items-center font-bold text-white">
	<h1 class="text-2xl"> Emergent </h1>
	<span>
		<button on:click={updateDom}> Run </button>
	</span>
	<span class="space-x-4">
		<span> Projects </span>
		<span> Account </span>
	</span>
</div>

<div class="flex flex-row" style="height: calc(100vh - 48px);">
	<div class="w-[65%] h-full flex flex-col bg-slate-300">
		<div class="h-[65%] flex flex-row">
			<iframe bind:this={iframe} class="grow" bind:clientWidth={cw} bind:clientHeight={ch} title="Output" />
			<div class="min-w-[30%] p-4 space-y-2 bg-slate-600 text-slate-200">
				{#if selected}
				<span class="block font-bold">{selected.name}</span>
				<div class="block">
					X: <input type="number" bind:this={inspectorX} on:change={({ target }) => {
						selected.transform.pos.x = parseInt(target.value);
						updateSprites();
					}} />
				</div>
				<div class="block">
					Y: <input type="number" bind:this={inspectorY} on:change={({ target }) => {
						selected.transform.pos.y = parseInt(target.value);
						updateSprites();
					}} />
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
		</div>
	</div>
	<div class="flex flex-row grow gap-2 overflow-hidden">
		<CodeMirror bind:value on:change={updateDom} lang={javascript()} theme={oneDark} useTab={true} tabSize={4} class="grow" styles={{"&": { height: "100%" }}}/>
	</div>
</div>