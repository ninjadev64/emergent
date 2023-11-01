<script>
	import { browser } from "$app/environment";

	if (browser) {
		let projects = JSON.parse(localStorage.getItem("projects") ?? "{}");
		for (const project of Object.keys(projects)) {
			indexedDB.deleteDatabase(project);
		}
		localStorage.removeItem("username", null);
		localStorage.removeItem("email", null);
		localStorage.removeItem("projects", null);
	}
</script>

<div class="mt-4 text-white text-center">
	<h1 class="font-bold"> Logout success </h1>
	<p> You have been successfully logged out of Emergent! </p>
</div>
