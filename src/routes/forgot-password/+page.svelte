<script>
	import { goto } from '$app/navigation';
	/** @type {import('./$types').PageData} */
	import AuthForm from '$lib/components/Auth/AuthForm.svelte';
	import { mailResetPasswordEmail } from '$lib/firebase/auth.client';
	import messsagesStore from '$lib/stores/messsages.store';
	let hideForm = false;
	async function onForgotPassword(e) {
		try {
			const formData = new FormData(e.target);
			const email = formData.get('email');

			if (!email) {
				messsagesStore.showError('Please enter a valid email');
				return;
			}

			await mailResetPasswordEmail(email);
			hideForm = true;
			messsagesStore.showSuccess('Email Sent');
			goto('/');
		} catch (error) {
			// @ts-ignore
			if (['auth/invalid-email', 'auth/user-not-found'].includes(e.code)) {
				messsagesStore.showError('Invalid email');
				return;
			}
			console.log(e);
			messsagesStore.showError(e.code);
		}
	}
	export let data;
</script>

<div class="row">
	<div class="col">
		<h1>Forgot Password</h1>
	</div>
</div>

{#if !hideForm}
	<AuthForm on:submit={onForgotPassword} btnName="Forgot Password" forgotPassword={true} />
{/if}

<svelte:head>
	<title>Book Lovers - Forgot Password</title>
</svelte:head>
