<script>
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	
	export let filter;
	let category, mask;
	
	export function updateObject(f) {
		filter = f;
		category.value = Math.log2(filter.category);
		
		if (filter.mask == -1) {
			mask.value = "-1";
		} else {
			let m = [];
			filter.mask.toString(2).split("").reverse().forEach((c, i) => {
				if (c == "1") m.push(i);
			});
			mask.value = m.join(",");
		}
	}
</script>

<div class="inspector">
	<p class="font-bold"> Layer </p>
	<input bind:this={category} class="w-full" type="number" min="0" max="31" placeholder="0-31" on:change={({ target }) => {
		filter.category = 2**(target.value);
		dispatch("update");
	}} />

	<p class="font-bold"> Collides with </p>
	<input bind:this={mask} class="w-full" type="text" placeholder="Comma-seperated layers" on:change={({ target }) => {
		if (target.value == "-1") {
			filter.mask = -1;
			return;
		}
		if (!/^(?:(?:(?:[0-2]?[0-9])|(?:3(?:0|1))),)*(?:(?:[0-2]?[0-9])|(?:3(?:0|1)))$/.test(target.value)) return;
		let a = [];
		target.value.split(",").forEach((l) => a.push(parseInt(l)));
		filter.mask = a.length == 1 ? 2**(a[0]) : a.reduce((a, b) => 2**a | 2**b);
		dispatch("update");
	}} />
</div>
