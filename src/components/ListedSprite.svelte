<script>
	export let sprite;
	export let selected;
	export let sprites;

    import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
</script>

<div class="p-2 cursor-pointer hover:bg-slate-700" class:!bg-slate-800={sprite.id == selected}>
	<button class="grow text-left" on:click={() => {dispatch("select", sprite.id)}}> {sprite.name} </button>
	<button class="float-right" on:click={() => {dispatch("remove", sprite.id)}}> × </button>
</div>

<div class="ml-8">
	{#each sprite.children as child}
		<svelte:self {sprites} sprite={sprites[child]} {selected} on:select on:remove />
	{/each}
</div>
