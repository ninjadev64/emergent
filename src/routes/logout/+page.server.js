export async function load({ cookies }) {
	cookies.delete("access_token", { path: "/", secure: false });
	cookies.delete("refresh_token", { path: "/", secure: false });
}
