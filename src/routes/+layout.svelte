<script>
	import Nav from '$lib/components/Nav.svelte';
	import messsagesStore from '$lib/stores/messsages.store';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '$lib/firebase/firebase.client';
	import { onMount } from 'svelte';
	import { sendJWTToken } from '$lib/firebase/auth.client';

	let timerId;

	async function sendServerToken() {
		try {
			await sendJWTToken();
		} catch (error) {
			clearInterval(timerId);
			console.log(error);
			messsagesStore.showError();
		}
	}

	onMount(async () => {
		try {
			await sendServerToken();
			timerId = setInterval(
				async () => {
					await sendServerToken();
				},
				1000 * 10 * 60
			);
		} catch (error) {
			console.log(error);
			messsagesStore.showError();
		}
	});

	function closeMessage() {
		messsagesStore.hide();
	}
</script>

<Nav />

<main class="container">
	{#if $messsagesStore.show}
		<div class="row mt-3">
			<div class="col">
				<div
					class:alert-danger={$messsagesStore.type === 'error'}
					class:alert-success={$messsagesStore.type === 'success'}
					class="alert alert-dismissible"
					role="alert"
				>
					<strong>{$messsagesStore.type === 'error' ? 'Error' : 'Success'}</strong>
					{$messsagesStore.message}
					<button type="button" class="btn-close" aria-label="Close" on:click={closeMessage} />
				</div>
			</div>
		</div>
	{/if}

	<slot />
</main>
