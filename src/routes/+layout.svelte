<script>
	import Nav from '$lib/components/Nav.svelte';
	import messsagesStore from '$lib/stores/messsages.store';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import '$lib/firebase/firebase.client';
	import { onMount } from 'svelte';
	import { sendJWTToken } from '$lib/firebase/auth.client';
	import authStore from '$lib/stores/auth.store.js';
	import bookNotifyStore from '$lib/stores/book-notify.store';
	import { onDestroy } from 'svelte';

	let notifyBook;

	const unsub = bookNotifyStore.subscribe((book) => {
		console.log(notifyBook);
		if (!$authStore.isLoggedIn) {
			notifyBook = book;
			return;
		}
		if ($authStore.userId !== book.user_id) {
			notifyBook = book;
			return;
		}
	});

	// Really won't fire ever b/c this is a +layout file (lives on every page etc)
	onDestroy(() => {
		unsub();
	});

	function closeAlert() {
		notifyBook = null;
	}

	export let data;

	let timerId;
	let isLoggedIn = data.isLoggedIn;

	$: isLoggedIn = $authStore.isActive ? $authStore.isLoggedIn : data.isLoggedIn;

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

<Nav isLoggedIn />

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
	{#if notifyBook}
		<div
			class="toast show position-fixed top-0 end-0 m-3"
			role="alert"
			aria-live="assertive"
			aria-atomic="true"
		>
			<div class="toast-header">
				<strong class="me-auto">New Book</strong>
				<button
					on:click={closeAlert}
					type="button"
					class="btn-close"
					data-bs-dismiss="toast"
					aria-label="Close"
				/>
			</div>
			<div class="toast-body">
				Book <a data-sveltekit-preload-data="hover" href="/book/{notifyBook.id}"
					>{notifyBook.title}</a
				> just created!!
			</div>
		</div>
	{/if}
</main>
