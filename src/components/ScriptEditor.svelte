<script>
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { oneDark } from "@codemirror/theme-one-dark";

	import scriptPlaceholder from "/public/placeholder.js?raw";

	export let scripts;
	let selectedScript;

	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	function update() {
		dispatch("update");
	}
</script>

<div class="flex flex-col grow overflow-hidden bg-slate-800">
	<!-- Tabs -->
	<div class="flex flex-row px-1 pt-1 text-slate-300 border-slate-500 border-b">
		{#each Object.keys(scripts) as script}
		<button class="inline p-2 min-w-[72px] bg-slate-800 border-slate-500 border-x border-t rounded-t-lg" on:click={() => {
			selectedScript = script;
			update();
		}}> {script} </button>
		{/each}
		<button class="inline p-2 bg-slate-600 border-slate-500 border-x border-t rounded-t-lg" on:click={() => {
			let script = prompt("Script name:");
			if (!script) return;
			scripts[script] = scriptPlaceholder;
			selectedScript = script;
			update();
		}}> Add script </button>
	</div>

	<!-- Code editor -->
	{#if selectedScript}
	<CodeMirror bind:value={scripts[selectedScript]} on:change={update} lang={javascript()} theme={oneDark} useTab={true} lineWrapping={true} tabSize={4} class="grow" styles={{"&": { height: "100%" }}}/>
	{:else}
	<div class="p-2 text-slate-300"> Create a script to get started! </div>
	{/if}
</div>