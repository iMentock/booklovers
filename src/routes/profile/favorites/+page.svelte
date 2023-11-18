<script>
	import Book from '$lib/components/Books/Book.svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	function filterUnlikedBooks(e) {
		const { id } = e.detail;

		data.books = data.books.filter((b) => b.id !== id);
	}
</script>

<div class="row">
	<div class="col">
		{#each data.books as book (book.id)}
			<Book {book} on:toggle_like={filterUnlikedBooks} />
		{/each}
	</div>
</div>
