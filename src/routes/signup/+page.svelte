<script>
	// @ts-nocheck

	import { goto } from '$app/navigation';
	import { registerWithEmailAndPassword } from '$lib/firebase/auth.client';
	import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
	import messsagesStore from '$lib/stores/messsages.store';
	import { afterLogin } from '$lib/helpers/route.helper';
	import { page } from '$app/stores';

	/**
	 * @param {{ target: HTMLFormElement | undefined; }} e
	 */
	async function register(e) {
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
			const user = await registerWithEmailAndPassword(email.toString(), password.toString());
			await afterLogin($page.url, user.uid);
		} catch (e) {
			// @ts-ignore
			if (e.code === 'auth/email-already-in-use') {
				messsagesStore.showError('You have already registered, please log in.');
				await goto('/login');
				return;
			}
			console.log(e);
			messsagesStore.showError();
		}
	}
</script>

<div class="row">
	<div class="col">
		<h1>Sign Up</h1>
	</div>
</div>
<hr />
<AuthForm on:submit={register} btnName="Sign Up!" />
<hr />
<LoginWithGoogle />
<svelte:head>
	<title>Book Lovers - Sign Up</title>
</svelte:head>
