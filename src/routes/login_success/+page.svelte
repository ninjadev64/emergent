<script>
	import { browser } from "$app/environment";

	let seconds = 5;

	if (browser) {
		let d = setInterval(() => {
			seconds -= 1;
			if (seconds == 0) {
				window.location.replace("/");
				clearInterval(d);
			}
		}, 1000);
	}
</script>

<div class="mt-4 text-white text-center">
	<h1 class="font-bold"> Login success </h1>
	<p> You have been successfully logged in to Emergent! </p>
	<p> Redirecting in {seconds} seconds... </p>
	<button class="button mt-2" on:click={() => window.location.replace("/")}> Continue </button>
</div>
