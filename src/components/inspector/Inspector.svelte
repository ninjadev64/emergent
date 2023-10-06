<script>
    import { createEventDispatcher } from "svelte";

	export let name;
	export let object;
	export let props;
	
	const dispatch = createEventDispatcher();

	export function updateObject(o) {
		object = o;
		for (const [key, value] of Object.entries(props)) {
			value.value = object[key];
		}
		props = props;
	}
</script>

<div class="inspector">
	<span class="font-bold"> {name} </span>
	{#each Object.keys(props) as prop}
	<div class="block">
		<p> {props[prop].name}: </p>
		{#if props[prop].type == "text"}
		<input class="w-full" id={prop} bind:value={props[prop].value} type="text" on:change={({ target }) => {
			object[prop] = target.value;
			dispatch("update");
		}} />
		{:else if props[prop].type == "number"}
		<input class="w-full" id={prop} bind:value={props[prop].value} type="number" on:change={({ target }) => {
			object[prop] = parseInt(target.value);
			dispatch("update");
		}} />
		{:else if props[prop].type == "boolean"}
		<input id={prop} bind:checked={props[prop].value} type="checkbox" on:change={({ target }) => {
			object[prop] = target.checked;
			dispatch("update");
		}} />
		{/if}
	</div>
	{/each}
</div>