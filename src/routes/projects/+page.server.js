import { error, redirect } from "@sveltejs/kit";

export const actions = {
	createProject: async ({ cookies, request }) => {
		const data = await request.formData();
		const res = await fetch(`https://api.github.com/user/repos`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${cookies.get("access_token")}`,
				"Content-Type": "application/json",
				"Accept": "application/vnd.github+json"
			},
			body: JSON.stringify({
				name: data.get("name"),
				description: `${data.get("name")}: a game created with Emergent`,
				private: true
			})
		});
		const json = await res.json();
		if (json.errors) throw error(400, `${json.message} - ${json.errors[0].message}`);
		return json;
	}
}

export async function load({ cookies }) {
	if (!cookies.get("access_token")) throw redirect(302, "/login");
	const res = await fetch(`https://api.github.com/user/repos`, {
		headers: {
			"Authorization": `Bearer ${cookies.get("access_token")}`,
			"Accept": "application/vnd.github+json"
		}
	});
	return { repos: await res.json() };
}
