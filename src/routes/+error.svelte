<script>
	import { page } from "$app/stores";
</script>

<div class="p-4 space-y-2 text-xl text-slate-300">
	<h1 class="text-2xl"> Error {$page.status} </h1>
	<p class="font-bold"> {$page.error.message} </p>
	<button class="p-2 bg-slate-500 text-slate-200 rounded-xl" on:click={() => window.location.reload()}> Reload </button>
</div>
