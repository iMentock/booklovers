// utilize this to disable the 'loading' or temporary showing of logged in/out navbar
export function load({ locals }) {
	return {
		isLoggedIn: locals.user !== null
	};
}
