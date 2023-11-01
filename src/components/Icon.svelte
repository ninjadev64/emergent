<script>
	export let rel;
	export let width;
	export let role = "image";
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<img src={`/icons/${rel}.png`} alt={rel} class="inline" {width} class:cursor-pointer={role == "button"} on:click on:keydown />
