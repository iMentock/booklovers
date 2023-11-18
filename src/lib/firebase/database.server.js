import { db } from '$lib/firebase/firebase.server';
import { firestore } from 'firebase-admin';
import { saveFileToBucket } from './firestorage.server';
import { PAGE_SIZE } from '$env/static/private';
import admin from 'firebase-admin';

export async function getUser(userId) {
	const user = await db.collection('users').doc(userId).get();
	return user?.data();
}

export async function addBook(book, userId) {
	// save to the firestore db w/out picture information
	const bookCollection = db.collection('books');

	const bookRef = await bookCollection.add({
		title: book.title,
		short_description: book.short_description,
		description: book.description,
		author: book.author,
		user_id: userId,
		created_at: admin.firestore.Timestamp.now().seconds,
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

export async function getBook(id, userId = null) {
	const bookRef = await db.collection('books').doc(id).get();

	if (bookRef.exists) {
		const user = userId ? await getUser(userId) : null;
		const likedBook = user?.bookIds?.includes(id) || false;

		return { id: bookRef.id, ...bookRef.data(), likedBook };
	}
}

export async function getBooks(userId = null, page = 1) {
	const user = userId ? await getUser(userId) : null;

	const bookCount = await db.collection('books').count().get();

	const totalBooks = bookCount.data().count;

	const next = totalBooks > page * +PAGE_SIZE;
	const previous = page > 1;
	const books = await db
		.collection('books')
		.limit(+PAGE_SIZE)
		.offset((page - 1) * +PAGE_SIZE)
		.orderBy('created_at', 'desc')
		.get();

	const likedBooks = books.docs.map((d) => {
		const likedBook = user?.bookIds?.includes(d.id) || false;

		return { ...d.data(), id: d.id };
	});

	return {
		books: likedBooks,
		next,
		previous
	};
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

export async function toggleBookLike(bookId, userId) {
	const bookDoc = db.collection('books').doc(bookId);
	const userDoc = db.collection('users').doc(userId);

	const user = await userDoc.get();
	const userData = user.data();

	// Book has already been liked so remove it from list and decrement on like
	if (userData.bookIds && userData.bookIds.includes(bookId)) {
		await userDoc.update({
			bookIds: admin.firestore.FieldValue.arrayRemove(bookId)
		});
		await bookDoc.update({
			likes: admin.firestore.FieldValue.increment(-1)
		});
	} else {
		// Book has NOT already been liked so add it to list and increment on like
		await userDoc.update({
			bookIds: admin.firestore.FieldValue.arrayUnion(bookId)
		});
		await bookDoc.update({
			likes: admin.firestore.FieldValue.increment(1)
		});
	}

	return await getBook(bookId, userId);
}

export async function getBooksForUser(userId) {
	const user = await getUser(userId);

	const books = await db
		.collection('books')
		.orderBy('created_at')
		.where('user_id', '==', userId)
		.get();

	return books.docs.map((d) => {
		const likedBook = user?.bookIds?.includes(d.id) || false;

		return { id: d.id, ...d.data(), likedBook };
	});
}

export async function getLikedBooks(userId) {
	const user = await getUser(userId);

	const bookIds = user?.bookIds || [];

	if (bookIds.length === 0) {
		return [];
	}

	const books = await db
		.collection('books')
		.where(admin.firestore.FieldPath.documentId(), 'in', bookIds)
		.get();

	return books.docs.map((d) => {
		return { id: d.id, ...d.data(), likedBook: true };
	});
}
