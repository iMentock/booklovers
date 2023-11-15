<script>
	/** @type {import('./$types').PageData} */
	import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
	import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import { loginWithEmailAndPassword } from '$lib/firebase/auth.client';
	import messsagesStore from '$lib/stores/messsages.store';
	import { afterLogin } from '$lib/helpers/route.helper';
	import { page } from '$app/stores';

	// export let data;

	async function loginClicked(e) {
		try {
			const formData = new FormData(e.target);
			const email = formData.get('email');
			const password = formData.get('password');
			if (!email || !password) {
				messsagesStore.showError('Please enter a valid email and password.');
				return;
			}
			if (password.toString().length < 6) {
				messsagesStore.showError('Password must be 6 characters or more.');
				return;
			}
			// @ts-ignore
			const user = await loginWithEmailAndPassword(email.toString(), password.toString());
			// @ts-ignore
			await afterLogin($page.url, user.uid);
		} catch (e) {
			// @ts-ignore
			if (
				[
					'auth/invalid-email',
					'auth/user-not-found',
					'auth/wrong-password',
					'auth/invalid-login-credentials'
					// @ts-ignore
				].includes(e.code)
			) {
				messsagesStore.showError('Invalid email or password');
				// await goto('/');
				return;
			}
			console.log(e);
			messsagesStore.showError();
		}
	}
</script>

<div class="row">
	<div class="col">
		<h1>Login</h1>
	</div>
</div>

<hr />
<AuthForm on:submit={loginClicked} btnName="Login" />
<hr />
<LoginWithGoogle />
<hr />
<div class="row">
	<div class="col">
		<a href="/forgot-password" class="btn btn-warning w-100">Forgot Password</a>
	</div>
</div>

<svelte:head>
	<title>Book Lovers - Login</title>
</svelte:head>
