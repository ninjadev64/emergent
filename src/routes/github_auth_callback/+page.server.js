import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "$env/static/private";
import { error, redirect } from "@sveltejs/kit";

export async function load({ url, cookies }) {
	const res = await fetch(`https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${url.searchParams.get("code")}`, {
		method: "POST",
		headers: {
			"Accept": "application/json"
		}
	});
	const json = await res.json();
	if (json.error) throw error(400, `${json.error}: ${json.error_description}`);

	cookies.set("access_token", json.access_token, {
		path: "/",
		sameSite: "strict",
		maxAge: json.expires_in,
		secure: false
	});
	cookies.set("refresh_token", json.refresh_token, {
		path: "/",
		sameSite: "strict",
		maxAge: json.refresh_token_expires_in,
		secure: false
	});

	throw redirect(302, "/login_success");
}
