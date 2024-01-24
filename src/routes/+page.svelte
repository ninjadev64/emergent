<script>
    import { onMount } from "svelte";

	import Icon from "../components/Icon.svelte";

	export let data, form;

	let projects = {};
	let select;

	onMount(() => {
		if (localStorage.getItem("projects")) projects = JSON.parse(localStorage.getItem("projects"));
		if (form) importProject(form);
	});

	function importProject(r) {
		let repo = parseInt(r) ? data.repos[r] : r;
		projects[repo.full_name] = {
			owner: {
				avatar_url: repo.owner.avatar_url,
				name: repo.owner.login
			},
			name: repo.full_name,
			url: repo.html_url
		};
		localStorage.setItem("projects", JSON.stringify(projects));
	}

	function removeProject(name) {
		delete projects[name];
		projects = projects;
		localStorage.setItem("projects", JSON.stringify(projects));
	}
</script>

<!-- Navbar -->
<div class="w-full h-[48px] p-4 flex justify-between items-center font-bold text-white">
	<div class="flex items-center space-x-2 text-2xl">
		<img class="h-7" src="/favicon.png" alt="Emergent logo" />
		<h1> Emergent </h1>
	</div>
	<span class="space-x-4">
		<Icon rel="sign-out" width="36px" role="button" on:click={() => window.location.href = "/logout"} />
	</span>
</div>

<div class="m-4 p-2 space-y-2 w-[28rem] bg-slate-400 text-slate-200 rounded-md">
	<!-- Repository creation -->
	<form class="flex w-full" method="POST" action="?/createProject">
		<input name="name" class="p-2 w-full rounded-md" placeholder="Project name" />
		<button class="button ml-2"> Create </button>
	</form>

	<!-- Repository importing -->
	<div class="flex">
		<select class="w-full rounded-md" bind:this={select}>
			<option value="emergent_placeholderoption" disabled selected> Choose a repository... </option>
			{#each data.repos as repo, i}
				{#if !projects[repo.full_name]}
					<option value={i}> {repo.full_name} </option>
				{/if}
			{/each}
		</select>
		<button class="button ml-2" on:click={() => {
			importProject(select.value);
			select.value = "emergent_placeholderoption";
		}}> Import </button>
	</div>
</div>

<!-- Locally available projects list -->
<div class="grid m-4 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(28rem, 28rem)) !important;">
	{#each Object.values(projects) as project}
		<div class="flex items-center p-4 w-[28rem] h-36 bg-slate-400 rounded-md">
			<img class="inline h-24 rounded-full" src={project.owner.avatar_url} alt={project.owner.name} />
			<div class="inline m-4 space-y-2">
				<h3 class="font-semibold break-all"> {project.name} </h3>
				<button class="button" on:click={() => window.location.href = `/${project.name}`}> Open </button>
				<button class="button" on:click={() => removeProject(project.name)}> Remove </button>
			</div>
		</div>
	{/each}
</div>
