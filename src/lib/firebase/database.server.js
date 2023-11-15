import { db } from '$lib/firebase/firebase.server';
import { firestore } from 'firebase-admin';
import { saveFileToBucket } from './firestorage.server';

export async function addBook(book, userId) {
	// save to the firestore db w/out picture information
	const bookCollection = db.collection('books');

	const bookRef = await bookCollection.add({
		title: book.title,
		short_description: book.short_description,
		description: book.description,
		author: book.author,
		user_id: userId,
		created_at: firestore.Timestamp.now().seconds,
		likes: 0
	});

	// save the pictures
	const smallPictureUrl = await saveFileToBucket(
		book.small_picture,
		`${userId}/${bookRef.id}/small_picture`
	);
	const mainPictureUrl = await saveFileToBucket(
		book.main_picture,
		`${userId}/${bookRef.id}/main_picture`
	);

	// update the doc in firestore db with picture urls
	await bookRef.update({
		main_picture: mainPictureUrl,
		small_picture: smallPictureUrl
	});

	// return bookId
	return bookRef.id;
}

export async function getBook(id) {
	const bookRef = await db.collection('books').doc(id).get();

	if (bookRef.exists) {
		return { id: bookRef.id, ...bookRef.data() };
	}
}

export async function editBook(id, formData, userId) {
	const bookRef = await db.collection('books').doc(id);

	let mainPicture = formData.main_picture || null;
	let smallPicture = formData.small_picture || null;

	delete formData.main_picture;
	delete formData.small_picture;
	await bookRef.update(formData);

	if (mainPicture && mainPicture.size) {
		const mainPictureUrl = await saveFileToBucket(
			mainPicture,
			`${userId}/${bookRef.id}/main_picture_${Date.now()}`
		);

		bookRef.update({ main_picture: mainPictureUrl });
	}

	if (smallPicture && mainPicture.size) {
		const smallPictureUrl = await saveFileToBucket(
			smallPicture,
			`${userId}/${bookRef.id}/small_picture_${Date.now()}`
		);

		bookRef.update({ small_picture: smallPictureUrl });
	}
}
