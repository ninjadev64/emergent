<script>
	import GenericInspector from "./GenericInspector.svelte";
	import CollisionLogicInspector from "./CollisionLogicInspector.svelte";

	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	function update() {
		dispatch("update");
	}

	export let sprite, scripts, modules;
	let name, transform, material, image, body, collisionLogic;
	let scriptInspectors = {};

	const transformProps = {
		"x": { type: "number", name: "X" },
		"y": { type: "number", name: "Y" },
		"width": { type: "number", name: "Width" },
		"height": { type: "number", name: "Height" }
	};
	const materialProps = {
		"fillStyle": { type: "text", name: "Fill style" },
		"opacity": { type: "number", name: "Opacity" },
		"lineWidth": { type: "number", name: "Line width" }
	};
	const imageProps = {
		"texture": { type: "text", name: "Texture path" },
		"xOffset": { type: "number", name: "X offset" },
		"yOffset": { type: "number", name: "Y offset" },
		"xScale": { type: "number", name: "X scale" },
		"yScale": { type: "number", name: "Y scale" }
	};
	const bodyProps = {
		"isStatic": { type: "boolean", name: "Static", disabled: !sprite.isTopLevel },
		"density": { type: "number", name: "Density" },
		"friction": { type: "number", name: "Friction" },
		"frictionAir": { type: "number", name: "Air resistance" }
	};

	export function updateSprite(s) {
		sprite = s;
		name.value = sprite.name;
		transform.updateObject(sprite.transform);
		material.updateObject(sprite.render);
		image.updateObject(sprite.render.sprite);

		bodyProps.isStatic.disabled = !sprite.isTopLevel;
		body.updateObject(sprite.body, bodyProps);
		
		collisionLogic.updateObject(sprite.body.collisionFilter);
	}
</script>

<!-- Metadata -->
<span class="block font-bold"> {sprite.name} </span>
<div class="inspector">
	<p class="font-bold"> Name </p>
	<input class="w-full" type="text" bind:this={name} on:change={({ target }) => {
		sprite.name = target.value;
		update();
	}} />
</div>
<div class="inspector">
	<p class="font-bold"> ID </p>
	<input class="w-full" readonly value={sprite.id} />
</div>

<!-- Core components -->
<GenericInspector on:update={update} name="Transform" bind:this={transform} object={sprite.transform} props={transformProps} />
<GenericInspector on:update={update} name="Material" bind:this={material} object={sprite.render} props={materialProps} />
<GenericInspector on:update={update} name="Image" bind:this={image} object={sprite.render.sprite} props={imageProps} />
<GenericInspector on:update={update} name="Body" bind:this={body} object={sprite.body} props={bodyProps} />
<CollisionLogicInspector on:update={update} bind:this={collisionLogic} filter={sprite.body.collisionFilter} />

<!-- Script configuration -->
{#each Object.keys(sprite.scripts) as script, i}
	<GenericInspector bind:this={scriptInspectors[i]} object={sprite.scripts[script]} name={script} props={modules[script].config} selfUpdating={true}>
		<div class="flex flex-row float-right space-x-2">
			<button on:click={async () => {
				modules[script] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(scripts[script]))).default;
				Object.keys(sprite.scripts[script]).forEach((key) => {
					if (!modules[script].config.hasOwnProperty(key)) delete sprite.scripts[script][key];
				});
				for (const [ key, value ] of Object.entries(modules[script].config)) {
					if (!sprite.scripts[script][key]) sprite.scripts[script][key] = value.default;
				}
				scriptInspectors[i].updateObject(sprite.scripts[script], modules[script].config);
				modules = modules;
			}}> ⟳ </button>
			<button on:click={() => {
				delete sprite.scripts[script];
				sprite.scripts = sprite.scripts;
			}}> × </button>
		</div>
	</GenericInspector>
{/each}

<!-- Script assignment -->
<div class="inspector">
	<p class="font-bold"> Add script </p>
	<select class="block w-full" on:change={async ({ target }) => {
		let defaults = {};
		if (!modules[target.value]) {
			modules[target.value] = (await import(/* @vite-ignore */ "data:text/javascript;base64," + btoa(scripts[target.value]))).default;
		}
		Object.entries(modules[target.value].config).forEach(([ key, value ]) => defaults[key] = value.default);
		sprite.scripts[target.value] = defaults;
		sprite.scripts = sprite.scripts;
		target.value = "emergent_placeholderoption";
		update();
	}}>
		<option value="emergent_placeholderoption" disabled selected> Select a script... </option>
		{#each Object.keys(scripts) as script}
			<option value={script}> {script} </option>
		{/each}
	</select>
</div>

<!-- Child creation -->
<div class="inspector">
	<p class="font-bold"> Create static child </p>
	<select class="block w-full" on:change={({ target }) => {
		dispatch("createChild", target.value);
		target.value = "emergent_placeholderoption";
	}}>
		<option value="emergent_placeholderoption" disabled selected> Select sprite type... </option>
		<option value="rect"> Rectangle </option>
		<option value="circle"> Circle </option>
	</select>
</div>
