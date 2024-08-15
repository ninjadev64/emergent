<script>
	import git from "isomorphic-git";
	import http from "isomorphic-git/http/web/index.cjs";
	import { Buffer } from "buffer";

	export let fs;

	export let user, repo;
	export let accessToken;

	export let save;

	const url = () => `https://x-access-token:${accessToken}@github.com/${user}/${repo}.git`;
	const dir = "/";

	let commitMessage;

	async function getUserData() {
		let userData = { username: localStorage.getItem("username"), email: localStorage.getItem("email") };

		if (!userData.username) {
			const usernameResponse = await fetch("https://api.github.com/user", { method: "GET", headers: { "Authorization": `Bearer ${accessToken}` }});
			userData.username = (await usernameResponse.json()).login;
			localStorage.setItem("username", userData.username);
		}

		if (!userData.email) {
			const emailResponse = await fetch("https://api.github.com/user/public_emails", { method: "GET", headers: { "Authorization": `Bearer ${accessToken}` }});
			const emails = await emailResponse.json();
			let selectedEmail;
			for (const email of emails) {
				if (email.email.endsWith("@users.noreply.github.com")) {
					selectedEmail = email.email;
					break;
				}
				if (email.visibility == "private") continue;
				if (email.primary || !selectedEmail) selectedEmail = email.email;
			}
			userData.email = selectedEmail;
			localStorage.setItem("email", selectedEmail);
		}

		return userData;
	}

	export async function init() {
		globalThis.Buffer = Buffer;
		try {
			await (fs().promises.stat("/.git"));
		} catch (e) {
			await git.clone({ fs: fs(), http, dir, url: url(), corsProxy: "https://cors.isomorphic-git.org" });
		}
	}
</script>

<p><span class="font-bold">Repository URL:</span> <a class="text-blue-300 underline" href={`https://github.com/${user}/${repo}`} target="_blank">https://github.com/{user}/{repo}</a></p>

<input class="mt-4 p-2 w-full bg-slate-600 rounded-md" bind:value={commitMessage} placeholder="Commit message" />

<button class="button mt-2 w-full !bg-slate-600" on:click={async () => {
	await save();
	await git.add({ fs: fs(), dir, filepath: "." });

	const userData = await getUserData();
	await git.commit({ fs: fs(), dir, message: commitMessage, author: { name: userData.username, email: userData.email } });
	commitMessage = "";
}}> Commit </button>

<button class="button mt-2 w-full !bg-slate-600" on:click={async () => {
	await git.push({ fs: fs(), http, dir, url: url(), remote: "origin", ref: await git.currentBranch({ fs: fs(), dir }), force: true, corsProxy: "https://cors.isomorphic-git.org" });
}}> Push </button>
