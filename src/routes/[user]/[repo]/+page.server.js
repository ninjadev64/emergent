import { error, redirect } from "@sveltejs/kit";

export async function load({ params, cookies }) {
	if (!cookies.get("access_token")) throw redirect(302, "/login");
	const res = await fetch(`https://api.github.com/repos/${params.user}/${params.repo}`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${cookies.get("access_token")}`
		}
	});
	const json = await res.json();
	switch (res.status) {
		case 200: break;
		case 404: throw error(404, "Repository is private or does not exist");
		default: throw error(res.status, json.message);
	}
	return { user: params.user, repo: params.repo, access_token: cookies.get("access_token") };
}
