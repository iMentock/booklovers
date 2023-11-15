<script>
	import { loginWithGoogle } from '$lib/firebase/auth.client';
	import messsagesStore from '$lib/stores/messsages.store';
	import { afterLogin } from '$lib/helpers/route.helper';
	import { page } from '$app/stores';

	async function loginGoogle() {
		try {
			const user = await loginWithGoogle();
			// console.log(user);
			// @ts-ignore
			await afterLogin($page.url, user.uid);
		} catch (e) {
			// @ts-ignore
			if (e.code === 'auth/popup-closed-by-user') {
				return;
			}
			console.log(e);
			messsagesStore.showError();
		}
	}
</script>

<div class="row">
	<div class="col">
		<button on:click={loginGoogle} class="btn btn-primary w-100">Login With Google</button>
	</div>
</div>
